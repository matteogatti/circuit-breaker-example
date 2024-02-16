import { getAllPosts } from '@/server/repository/post';
import { getAllUsers } from '@/server/repository/user';
import { hasCrazyMonkey } from '@/server/utils/crazyMonkey';
import express from 'express';
import ViteExpress from 'vite-express';

const app = express();

app.get('/api/v1/posts', async (_, res) => {
  if (hasCrazyMonkey()) {
    const posts = await getAllPosts();
    res.status(200).json(posts);
  } else {
    res.status(400).json({ error: true });
  }
});

app.get('/api/v1/users', async (_, res) => {
  if (hasCrazyMonkey()) {
    const users = await getAllUsers();
    res.status(200).json(users);
  } else {
    res.status(400).json({ error: true });
  }
});

ViteExpress.listen(app, 3000, () =>
  console.log('Server is listening on port 3000...')
);
