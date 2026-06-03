import express from 'express';
import * as postController from "../controllers/postController";
import * as authController from "../controllers/authController";
import { validate } from "../utils/validate";
import { createPostSchema } from "../utils/schemas";

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(postController.getAllPosts)
  .post(authController.protect, validate(createPostSchema), postController.createPost);

router.route('/search')
  .get(postController.searchPosts);

router.route('/:id')
  .get(postController.getPost);

router.route('/:id/upvote')
  .patch(authController.protect, postController.upvotePost);

export default router;