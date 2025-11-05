/* eslint-disable prettier/prettier */
import { prisma } from '../config/db';
import { MessageRequestDTO } from '../dto/message.dto';
class MessageService {
  async chat(data: MessageRequestDTO, userId: string) {
    const { query, room_id } = data;
    let room = room_id
      ? await prisma.room.findUnique({
          where: { room_id: Number(room_id) },
        })
      : null;

    room ??= await prisma.room.create({
      data: {
        room_name: `Room-${Date.now()}`,
        user_id: Number(userId),
      },
    });
    const userMessage = await prisma.message.create({
      data: {
        role: 'USER',
        content: query,
        room_id: room.room_id,
      },
    });
    const reply = `You said: "${query}"`;

    const assistantMessage = await prisma.message.create({
      data: {
        role: 'ASSISTANT',
        content: reply,
        room_id: room.room_id,
      },
    });
    return {
      room_id: room.room_id,
      room_name: room.room_name,
      userId: room.user_id,
      userMessage,
      assistantMessage,
    };
  }
  async getRoom(roomId: string) {
    const room = await prisma.room.findUnique({
      where: { room_id: Number(roomId) },
    });
    if (!room) {
      throw new Error('Room not found');
    }
    const messagesCount = await prisma.message.count({
      where: { room_id: Number(roomId) },
    });
    const skip = messagesCount - 10;
    const messages = await prisma.message.findMany({
      where: { room_id: Number(roomId) },
      skip,
      take: 10,
    });
    const result = { ...room, messages };
    return result;
  }
  async getMessages(
    roomId: string,
    page: string,
    limit: string,
    offset: string,
  ) {
    const room = await prisma.room.findUnique({
      where: { room_id: Number(roomId) },
    });
    if (!room) {
      throw new Error('Room not found');
    }
    const messagesCount = await prisma.message.count({
      where: { room_id: Number(roomId) },
    });
    const messages = await prisma.message.findMany({
      where: { room_id: Number(roomId) },
      skip: (Number(page) - 1) * Number(offset),
      take: limit ? Number(limit) : 10,
    });
    const totalMessages = messagesCount;
    const result = { ...room, messages, totalMessages };
    return result;
  }
  async getRooms() {
    const rooms = await prisma.room.findMany();
    if (!rooms) throw new Error('Rooms not found');
    return rooms;
  }
}

const messageService = new MessageService();
export { messageService };
