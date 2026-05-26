import express from 'express';
import * as commentController from '../controllers/commentController';
import * as authController from '../controllers/authController';

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(commentController.getComments)
  .post(authController.protect, commentController.createComment);

router.route('/:commentId/upvote')
  .patch(authController.protect, commentController.upvoteComment);

export default router;