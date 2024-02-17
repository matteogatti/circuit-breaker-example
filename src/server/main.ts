import { METHOD, STATUS } from '@/server/model/method';
import { createPost, getAllPosts } from '@/server/repository/post';
import { getAllUsers } from '@/server/repository/user';
import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';
import { getRequestID, setRequestID } from '@/server/utils/requestId';
import ViteExpress from 'vite-express';
import bodyParser from 'body-parser';
import { listPostPresenter, singlePostPresenter } from '@/server/presenter/post';
// import pinoHttp from 'pino-http';

const app = express().disable('x-powered-by');
const prisma = new PrismaClient();

// ... MIDDLEWARES

app.use(setRequestID()); // SET UNIQUE UUID PER REQUEST
app.use(bodyParser.json()); // PARSE BODY AS JSON
// app.use(pinoHttp()); // LOG ALL REQUESTS

// ... ROUTES

app.get('/api/v1/posts', async (_: Request, res: Response) => {
  const uuid = getRequestID(res);

  const result = await getAllPosts(uuid, prisma);
  if ('errorCode' in result) {
    return res.status(STATUS.BAD_REQUEST).json(result);
  }
  return res.status(STATUS.OK).json(listPostPresenter(result));
});

app.post('/api/v1/posts', async (req: Request, res: Response) => {
  const uuid = getRequestID(res);

  const {
    body: { title, content },
  } = req;

  const result = await createPost(uuid, prisma, { title, content });
  if ('errorCode' in result) {
    return res.status(STATUS.BAD_REQUEST).json(result);
  }
  return res.status(STATUS.OK).json(singlePostPresenter(result));
});

app.get('/api/v1/users', async (req: Request, res: Response) => {
  const { method } = req;
  const uuid = getRequestID(res);

  if (method === METHOD.GET) {
    try {
      const result = await getAllUsers(uuid, prisma);
      if ('errorCode' in result) {
        return res.status(STATUS.BAD_REQUEST).json(result);
      }
      return res.status(STATUS.OK).json(result);
    } catch (e) {
      return res.status(STATUS.BAD_REQUEST).json({ error: e });
    }
  }

  return res.status(STATUS.BAD_REQUEST).json({});
});

// ... EVENTS

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// ... SERVER START

ViteExpress.listen(app, 3000, () => console.log('Server is listening on port 3000...'));
