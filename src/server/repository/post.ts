import { PrismaCircuitBreaker } from '@/server/utils/circuitBreaker/DatabaseCircuitBreaker';
import logger from '@/server/utils/logger';
import { Post, PrismaClient } from '@prisma/client';

export const getAllPosts = async (): Promise<Post[] | void> => {
  const prisma = new PrismaClient();

  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
      },
    });
    logger.info(`[DB] list Post: ${posts.length}`);
    return posts;
  } catch (e) {
    logger.error(`[DB] list Post error: ${e}`);
    throw e;
  }
};

type SavePost = Pick<Post, 'title' | 'content'>;

export const createPost = async ({ title, content }: SavePost): Promise<Post> => {
  try {
    const client = new PrismaCircuitBreaker();

    const author = await client.exec((prisma: PrismaClient) =>
      prisma.user.findFirstOrThrow()
    );

    const post = await client.exec((prisma: PrismaClient) =>
      prisma.post.create({
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
      })
    );
    return post;
  } catch (e) {
    throw e;
  }
};
