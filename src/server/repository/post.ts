import { DatabaseCrazyMonkeyException } from '@/server/exception/database';
import { createCircuitBreaker } from '@/server/utils/circuitBreaker';
import { hasCrazyMonkey } from '@/server/utils/crazyMonkey';
import { Post, PrismaClient } from '@prisma/client';

// ... LIST

const getDatabaseAllPosts = async (prisma: PrismaClient): Promise<Post[] | void> => {
  try {
    if (hasCrazyMonkey()) {
      return new Promise((_, reject) => setTimeout(() => reject(new DatabaseCrazyMonkeyException('crazy monkey')), 1000));
    }

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

export const getAllPosts = async (uuid: string, prisma: PrismaClient) => {
  const breaker = createCircuitBreaker(uuid, getDatabaseAllPosts);
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

export const createPost = async (uuid: string, prisma: PrismaClient, { title, content }: CreatePost) => {
  const breaker = createCircuitBreaker(uuid, createDatabasePost);
  return breaker(prisma, {
    title,
    content,
  });
};
