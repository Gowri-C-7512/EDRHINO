import { Router } from 'express';
import { pdfController } from '../controller/pdf.controller';
import pdfUpload from '../middleware/upload.middleware';
import Promisify from '../utils/Promisify';

const pdfRouter = Router();

pdfRouter
  .route('/pdf')
  .post(pdfUpload.single('file_url'), Promisify(pdfController.uploadPdf));
pdfRouter.route('/pdfs/:id').get(Promisify(pdfController.getPdf));
pdfRouter.route('/pdfs').get(Promisify(pdfController.getAllPdf));
pdfRouter.route('/deletePdf/:id').delete(Promisify(pdfController.deletePdf));
pdfRouter
  .route('/updatePdf/:id')
  .patch(pdfUpload.single('file_url'), Promisify(pdfController.updatePdf));
export { pdfRouter };
