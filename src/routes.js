import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetappController from './app/controllers/MeetappController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/meetapps', MeetappController.index);
routes.post('/meetapps', MeetappController.store);
routes.put('/meetapps/:id', MeetappController.update);
routes.delete('/meetapps/:id', MeetappController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
