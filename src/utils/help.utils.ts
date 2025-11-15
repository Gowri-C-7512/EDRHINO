import { Request } from 'express';
import fs from 'fs';
import logger from './winston.logger';

export const getStaticFilePath = (req: Request, fileName: string) => {
  const protocol = process.env.ENVPATH;
  return `${protocol}://${req.get('host')}/files/${fileName}`;
};

export const getLocalPath = (fileName: string) => {
  return `uploads/pdf/${fileName}`;
};

export const getStaticPdfFilePath = (req: Request, fileName: string) => {
  const protocol = process.env.ENVPATH;
  return `${protocol}://${req.get('host')}/pdf/${fileName}`;
};
export const getLocalPaths = (fileName: string) => {
  return `uploads/pdf/${fileName}`;
};

export const removeLocalFile = (localPath: string) => {
  fs.unlink(localPath, (err) => {
    if (err) logger.info('Error while removing local files: ', err);
    else {
      logger.info(localPath);
    }
  });
};
