import express from 'express';
import * as dungeonController from "../controllers/dungeonController";
import * as authController from "../controllers/authController";
import postRouter from './postRoutes';

const router = express.Router();

router.use('/:dungeonId/posts', postRouter);

router.route('/')
  .get(dungeonController.getAllDungeons)
  .post(authController.protect, dungeonController.createDungeon);


router.get('/my-dungeons', authController.protect, dungeonController.getMyDungeons);
router.patch('/:id/subscribe', authController.protect, dungeonController.subscribeToDungeon);

router.route('/:id')
  .get(dungeonController.getDungeon)
  .patch(authController.protect, dungeonController.updateDungeon);

export default router;