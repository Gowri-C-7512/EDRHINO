import { PrismaClient } from '@prisma/client';
import logger from '../utils/winston.logger';
// import { graphCheckPointer } from '../ai/memory';

const prisma = new PrismaClient();
export const connectToDb = async () => {
  try {
    await prisma.$connect();
    // graphCheckPointer.setup().then(()=> logger.info(' Graph checkpointer setup complete'));
    logger.info(' Connected to PostgreSQL database');
  } catch (error) {
    logger.error(' Database connection failed:', error);
    process.exit(1);
  }
};

export { prisma };
