import { METHOD, STATUS } from '@/server/model/method';
import { createPost, getAllPost } from '@/server/repository/post';
import { getAllUsers } from '@/server/repository/user';
import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';
import requestID from '@/server/utils/requestId';
import ViteExpress from 'vite-express';

const app = express().disable('x-powered-by');
const prisma = new PrismaClient();

// ... MIDDLEWARES

app.use(requestID());

// ... ROUTES

app.get('/api/v1/posts', async (req: Request, res: Response) => {
  const { method } = req;

  if (method === METHOD.GET) {
    const posts = await getAllPost(prisma);
    return res.status(STATUS.OK).json(posts);
  }

  if (method === METHOD.POST) {
    const {
      body: { title, content },
    } = req;

    const post = await createPost(prisma, { title, content });
    return res.status(STATUS.OK).json(post);
  }

  return res.status(STATUS.BAD_REQUEST).json({});
});

app.get('/api/v1/users', async (req: Request, res: Response) => {
  const { method } = req;

  if (method === METHOD.GET) {
    try {
      const users = await getAllUsers(prisma);
      return res.status(STATUS.OK).json(users);
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
