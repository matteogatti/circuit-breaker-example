import logger from '@/server/utils/logger';
import { Post, PrismaClient } from '@prisma/client';
import CircuitBreaker from 'opossum';

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
  const breaker = new CircuitBreaker(getDatabaseAllPosts);
  breaker.on('success', (result) => logger.info(`[SUCCESS] getAllPost ${JSON.stringify(result)}`));
  breaker.on('reject', () => logger.error(`[REJECTED] getAllPost`));
  breaker.on('fallback', (data) => logger.info(`[FALLBACK] ${JSON.stringify(data)}`));
  return breaker.fire(prisma);
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
  const breaker = new CircuitBreaker(createDatabasePost);
  breaker.on('success', (result) => logger.info(`[SUCCESS] createPost: ${JSON.stringify(result)}`));
  breaker.on('reject', () => logger.error(`[REJECTED] createPost`));
  breaker.on('fallback', (data) => logger.info(`[FALLBACK] createPost ${JSON.stringify(data)}`));
  return breaker.fire(prisma, {
    title,
    content,
  });
};
