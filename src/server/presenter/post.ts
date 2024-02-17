import { Post } from '@prisma/client';
import dayjs from 'dayjs';

export const listPostPresenter = (posts: Post[]) => {
  return posts.map((post) => singlePostPresenter(post));
};

export const singlePostPresenter = (post: Post) => {
  return {
    title: post.title,
    content: post.content,
    createdAt: dayjs(post.createdAt).toISOString(),
    updatedAt: dayjs(post.updatedAt).toISOString(),
  };
};
