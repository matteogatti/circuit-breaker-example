import { DatabaseCrazyMonkeyException, DatabaseInvalidParametersException } from '@/server/exception/database';
import { CircuitBreakerFunction, ExecuteFunction, createCircuitBreaker } from '@/server/utils/circuitBreaker';
import { hasCrazyMonkey } from '@/server/utils/crazyMonkey';
import { DatabaseErrorHandlerResponse } from '@/server/utils/handler/error';
import { Post, PrismaClient } from '@prisma/client';
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
});

// ... LIST

const getDatabaseAllPosts: ExecuteFunction<[PrismaClient], Post[]> = async (prisma: PrismaClient) => {
  try {
    if (hasCrazyMonkey()) {
      return new Promise((_, reject) => setTimeout(() => reject(new DatabaseCrazyMonkeyException('Crazy monkey!')), 1000));
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

export const getAllPosts: CircuitBreakerFunction<[string, PrismaClient], Post[] | DatabaseErrorHandlerResponse> = async (
  uuid: string,
  prisma: PrismaClient
) => {
  const breaker = createCircuitBreaker(uuid, getDatabaseAllPosts);
  return breaker(prisma);
};

// ... CREATE

type CreatePost = Pick<Post, 'title' | 'content'>;

const createDatabasePost: ExecuteFunction<[PrismaClient, CreatePost], Post> = async (prisma: PrismaClient, { title, content }: CreatePost) => {
  try {
    if (!PostSchema.parse({ title, content })) {
      return Promise.reject(() => new DatabaseInvalidParametersException());
    }

    const author = await prisma.user.findFirstOrThrow();

    const post = await prisma.post.create({
      data: {
        title,
        content,
        createdAt: new Date(),
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

export const createPost: CircuitBreakerFunction<[string, PrismaClient, CreatePost], Post | DatabaseErrorHandlerResponse> = async (
  uuid: string,
  prisma: PrismaClient,
  { title, content }: CreatePost
) => {
  const breaker = createCircuitBreaker(uuid, createDatabasePost);
  return breaker(prisma, {
    title,
    content,
  });
};
