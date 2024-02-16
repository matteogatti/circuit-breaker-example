import { METHOD, STATUS } from '@/server/model/method';
import { createPost, getAllPosts } from '@/server/repository/post';
import { getAllUsers } from '@/server/repository/user';
import express, { Request, Response } from 'express';
import ViteExpress from 'vite-express';

const app = express();

app.get('/api/v1/posts', async (req: Request, res: Response) => {
  const { method } = req;

  if (method === METHOD.GET) {
    const posts = await getAllPosts();
    return res.status(STATUS.OK).json(posts);
  }

  if (method === METHOD.POST) {
    const {
      body: { title, content },
    } = req;

    const post = await createPost({ title, content });
    return res.status(STATUS.OK).json(post);
  }

  return res.status(STATUS.BAD_REQUEST).json({});
});

app.get('/api/v1/users', async (req: Request, res: Response) => {
  const { method } = req;

  if (method === METHOD.GET) {
    try {
      const users = await getAllUsers();
      return res.status(STATUS.OK).json(users);
    } catch (e) {
      return res.status(STATUS.BAD_REQUEST).json({ error: e });
    }
  }

  return res.status(STATUS.BAD_REQUEST).json({});
});

ViteExpress.listen(app, 3000, () =>
  console.log('Server is listening on port 3000...')
);
