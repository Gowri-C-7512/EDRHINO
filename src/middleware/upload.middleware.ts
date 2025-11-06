import fs from 'fs';
import multer from 'multer';
import path from 'path';
import logger from '../utils/winston.logger';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // This storage needs public/images folder in the root directory
    // Else it will throw an error saying cannot find path public/images
    const folderPath = path.join('./', 'public/files');

    // Create folder if it doesn't exist
    if (fs.existsSync(folderPath)) {
      logger.info('Folder already exists');
    } else {
      fs.mkdirSync(folderPath, { recursive: true });
      logger.info('Folder created successfully');
    }
    cb(null, './public/files');
  },
  // Store file in a .png/.jpeg/.jpg format instead of binary
  filename: function (req, file, cb) {
    let fileExtension = '';
    if (file.originalname.split('.').length > 1) {
      fileExtension = file.originalname.substring(
        file.originalname.lastIndexOf('.'),
      );
    }
    const filenameWithoutExtension = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-')
      ?.split('.')[0];
    cb(
      null,
      filenameWithoutExtension +
        Date.now() +
        Math.ceil(Math.random() * 1e5) + // avoid rare name conflict
        fileExtension,
    );
  },
});

// Middleware responsible to read form data and upload the File object to the mentioned path
export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1000 * 1000,
  },
});

const storages = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderPath = path.join('./', 'uploads/pdf');

    // Create folder if it doesn't exist
    if (fs.existsSync(folderPath)) {
      logger.info('Folder already exists');
    } else {
      fs.mkdirSync(folderPath, { recursive: true });
      logger.info('Folder created successfully');
    }
    cb(null, 'uploads/pdf'); // folder for PDF uploads
  },

  filename: function (req, file, cb) {
    // Extract extension
    let fileExtension = '';
    if (file.originalname.includes('.')) {
      fileExtension = file.originalname.substring(
        file.originalname.lastIndexOf('.'),
      );
    }
    const filenameWithoutExtension = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-')
      ?.split('.')[0];

    const uniqueName =
      filenameWithoutExtension +
      Date.now() +
      Math.ceil(Math.random() * 1e5) +
      fileExtension;

    cb(null, uniqueName);
  },
});

// Allow only PDFs
function pdfFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDFs are allowed!'));
  }
}

const pdfUpload = multer({
  storage: storages,
  fileFilter: pdfFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional limit: 10 MB
});

export default pdfUpload;
