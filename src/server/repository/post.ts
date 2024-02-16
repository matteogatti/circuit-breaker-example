import { createCircuitBreaker } from '@/server/utils/circuitBreaker';
import logger from '@/server/utils/logger';
import { Post, PrismaClient } from '@prisma/client';

// ... LIST

const getDatabaseAllPosts = async (prisma: PrismaClient): Promise<Post[] | void> => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
      },
    });
    return posts;
  } catch (e) {
    throw e;
  }
};

export const getAllPost = async (prisma: PrismaClient) => {
  const breaker = createCircuitBreaker(getDatabaseAllPosts, logger);
  return breaker(prisma);
};

// ... CREATE

type CreatePost = Pick<Post, 'title' | 'content'>;

const createDatabasePost = async (prisma: PrismaClient, { title, content }: CreatePost): Promise<Post> => {
  try {
    const author = await prisma.user.findFirstOrThrow();

    const post = await prisma.post.create({
      data: {
        title,
        content,
        author: {
          connect: {
            email: author.email,
          },
        },
      },
      include: {
        author: true,
      },
    });
    return post;
  } catch (e) {
    throw e;
  }
};

export const createPost = async (prisma: PrismaClient, { title, content }: CreatePost) => {
  const breaker = createCircuitBreaker(createDatabasePost, logger);
  return breaker(prisma, {
    title,
    content,
  });
};
