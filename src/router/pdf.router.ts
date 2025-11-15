import { Router } from 'express';
import { pdfController } from '../controller/pdf.controller';
import pdfUpload from '../middleware/upload.middleware';
import Promisify from '../utils/Promisify';

const pdfRouter = Router();

pdfRouter
  .route('/')
  .post(pdfUpload.single('file_url'), Promisify(pdfController.uploadPdf))
  .get(Promisify(pdfController.getAllPdf));
pdfRouter
  .route('/:id')
  .get(Promisify(pdfController.getPdf))
  .delete(Promisify(pdfController.deletePdf))
  .patch(pdfUpload.single('file_url'), Promisify(pdfController.updatePdf));

export { pdfRouter };
