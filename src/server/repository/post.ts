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
