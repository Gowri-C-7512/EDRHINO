/* eslint-disable prettier/prettier */
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

class PdfService {
  async uploadPdf(data: { title: string; file_url: string }) {
    const upload = await prisma.document.create({
      data: {
        title: data.title,
        file_url: data.file_url,
      },
    });
    return upload;
  }

  async updatePdf(
    id: string,
    data: Partial<{ title: string; file_url: string }>,
  ) {
    const updateData: { title?: string; file_url?: string } = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.file_url !== undefined) updateData.file_url = data.file_url;

    const updatedRecord = await prisma.document.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return updatedRecord;
  }

  async getPdf(id: string) {
    const pdf = await prisma.document.findUnique({
      where: { id: Number(id) },
    });

    return pdf;
  }

  async getAllPdf() {
    const pdfList = await prisma.document.findMany();
    return pdfList;
  }

  async deletePdf(pdfId: string) {
    const user = await prisma.user.delete({
      where: { id: Number(pdfId) },
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

const pdfService = new PdfService();
export { pdfService };
