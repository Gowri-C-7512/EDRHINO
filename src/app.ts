import express from 'express';
import { APIVERSION } from './constants/version';
//import { verifyApiKey } from './middleware/auth.middleware';
import { errorHandler } from './middleware/errorhandler.middleware';
import morganMiddleware from './middleware/morgan.middleware';
import { authRouter } from './router/auth.router';
//import Promisify from './utils/Promisify';

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morganMiddleware);

app.use('/health', (req, res) => res.send('OK'));
//app.use(Promisify(verifyApiKey));
app.use(`/api/${APIVERSION.V1}/auth`, authRouter);

app.use(errorHandler);
export { app };

