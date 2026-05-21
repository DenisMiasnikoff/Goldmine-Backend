import express from 'express';
import * as postController from "../controllers/postController";
import * as authController from "../controllers/authController";

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(postController.getAllPosts)
  .post(authController.protect, postController.createPost);

router.route('/:id')
  .get(postController.getPost);

router.route('/:id/upvote')
  .patch(authController.protect, postController.upvotePost);

export default router;