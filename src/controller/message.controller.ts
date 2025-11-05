import { validate } from 'class-validator';
import { Response } from 'express';
import { MessageRequestDTO } from '../dto/message.dto';
import { WithUserRequest } from '../middleware/auth.middleware';
import { messageService } from '../services/message.service';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

class MessageController {
  async chat(req: WithUserRequest, res: Response) {
    const user_id = req.user?.id;
    if (!user_id) throw new ApiError(401, 'User not authenticated');
    console.log(typeof user_id);
    const chatRequest = new MessageRequestDTO();
    Object.assign(chatRequest, req.body);
    const errors = await validate(chatRequest);
    if (errors.length > 0) throw new ApiError(400, 'Invalid input', errors);
    const userData: MessageRequestDTO = req.body;
    const result = await messageService.chat(userData, user_id.toString());
    return res
      .status(200)
      .json(new ApiResponse(200, result, 'message sent successfully'));
  }

  async getRoom(req: WithUserRequest, res: Response) {
    const { id } = req.params;
    const room = await messageService.getRoom(id);
    return res
      .status(200)
      .json(new ApiResponse(200, room, 'fetch room successfully'));
  }
  async getRooms(req: WithUserRequest, res: Response) {
    const rooms = await messageService.getRooms();
    return res
      .status(200)
      .json(new ApiResponse(200, rooms, 'fetch rooms successfully'));
  }
  async getMessages(req: WithUserRequest, res: Response) {
    const { id } = req.params;
    const { page, limit, offset } = req.query;
    const messages = await messageService.getMessages(
      id,
      page as string,
      limit as string,
      offset as string,
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          messages,
          'messages fetched sucessfully with pagination',
        ),
      );
  }
}

const messageController = new MessageController();
export { messageController };
