import express from 'express';
import * as itemController from "../controllers/itemController";
import * as authController from "../controllers/authController";

const router = express.Router();

router.route('/')
  .get(itemController.getAllItems)
  .post(authController.protect, itemController.createItem);

router.post('/buy/:itemId', authController.protect, itemController.buyItem);

export default router;