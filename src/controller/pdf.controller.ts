import { Request, Response } from 'express';
import path from 'path';
import { pdfService } from '../services/pdf.service';
import { ApiResponse } from '../utils/ApiResponse';
import { getStaticPdfFilePath } from '../utils/help.utils';
import logger from '../utils/winston.logger';

class PdfController {
  async uploadPdf(req: Request, res: Response) {
    let file_name = ' ';
    const userData = req.body;
    if (req.file) {
      const fileData = req.file;

      const file_url = fileData
        ? getStaticPdfFilePath(req, fileData.filename)
        : '';
      userData.file_url = file_url;
      file_name = fileData.filename;
      if (file_name) {
        const ext = path.extname(file_name).toLowerCase();
        logger.info(`ext:${ext}`);
      }
      logger.info(`filename ${file_name}`);
    }
    const updatedUser = await pdfService.uploadPdf(userData);

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, 'Upload pdf successfully'));
  }

  async updatePdf(req: Request, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    if (req.file) {
      const file_url = getStaticPdfFilePath(req, req.file.filename);
      updateData.file_url = file_url;
    }
    const update = await pdfService.updatePdf(id, updateData);

    return res
      .status(200)
      .json(new ApiResponse(200, update, 'PDF updated successfully'));
  }

  async getPdf(req: Request, res: Response) {
    const { id } = req.params;
    const room = await pdfService.getPdf(id);
    return res
      .status(200)
      .json(new ApiResponse(200, room, 'fetch pdf successfully'));
  }
  async getAllPdf(req: Request, res: Response) {
    const rooms = await pdfService.getAllPdf();
    return res
      .status(200)
      .json(new ApiResponse(200, rooms, 'fetch all pdf successfully'));
  }

  async deletePdf(req: Request, res: Response) {
    const { id } = req.params;
    const user = await pdfService.deletePdf(id);
    return res.status(200).json(new ApiResponse(200, user, 'User deleted'));
  }
}

const pdfController = new PdfController();
export { pdfController };
