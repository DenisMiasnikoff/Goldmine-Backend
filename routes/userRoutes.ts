import express from 'express';
import * as authController from "../controllers/authController";
import * as userController from "../controllers/userController";
import { validate } from "../utils/validate";
import { signupSchema, loginSchema, updateMeSchema } from "../utils/schemas";

const router = express.Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.get('/profile/:username', userController.getUserByUsername);
router.patch('/equipItem/:itemId', userController.equipItem);
router.patch('/updateMe', validate(updateMeSchema), userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

export default router;