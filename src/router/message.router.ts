import { Router } from 'express';
import { messageController } from '../controller/message.controller';
import { verifyjwt } from '../middleware/auth.middleware';
import Promisify from '../utils/Promisify';

const messageRouter = Router();
messageRouter
  .route('/message')
  .post(verifyjwt, Promisify(messageController.chat));
messageRouter
  .route('/rooms/:id')
  .get(verifyjwt, Promisify(messageController.getRoom));
messageRouter.route('/rooms').get(verifyjwt, messageController.getRooms);
messageRouter
  .route('/rooms/:id/messages')
  .get(verifyjwt, messageController.getMessages);
export { messageRouter };
