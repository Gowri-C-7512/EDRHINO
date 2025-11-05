import express from 'express';
import { APIVERSION } from './constants/version';
import { verifyApiKey } from './middleware/auth.middleware';
import { errorHandler } from './middleware/errorhandler.middleware';
import morganMiddleware from './middleware/morgan.middleware';
import Promisify from './utils/Promisify';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { authRouter } from './router/auth.router';
import { messageRouter } from './router/message.router';
import { pdfRouter } from './router/pdf.router';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morganMiddleware);

const swaggerDocument = YAML.load('./swagger.yaml');
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=swagger.json');
  res.send(swaggerDocument);
});

app.use('/health', (req, res) => res.send('OK'));
app.use(Promisify(verifyApiKey));
app.use(`/api/${APIVERSION.V1}/auth`, authRouter);
app.use(`/api/${APIVERSION.V1}`, messageRouter);
app.use(`/api/${APIVERSION.V1}/uploads`, pdfRouter);
app.use(errorHandler);

export { app };
