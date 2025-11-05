import { Router } from 'express';
import { pdfController } from '../controller/pdf.controller';
import pdfUpload from '../middleware/upload.middleware';
import Promisify from '../utils/Promisify';

const pdfRouter = Router();

pdfRouter
  .route('/uploads')
  .post(pdfUpload.single('file_url'), Promisify(pdfController.uploadPdf));
pdfRouter.route('/pdf/:id').get(Promisify(pdfController.getPdf));
pdfRouter.route('/pdf').get(Promisify(pdfController.getAllPdf));
pdfRouter.route('/pdf/:id').delete(Promisify(pdfController.deletePdf));
pdfRouter
  .route('/pdf/:id')
  .patch(pdfUpload.single('file_url'), Promisify(pdfController.updatePdf));
export { pdfRouter };
