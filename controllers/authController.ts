import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import User, { IUser } from "../models/userModel";
import sendEmail from "../utils/email";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Shape of decoded JWT token
interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

const signToken = (id: string): string => {
  const options: SignOptions = {
  expiresIn: process.env.JWT_EXPIRES_IN as any
};
  
  return jwt.sign({ id }, process.env.JWT_SECRET as string, options);
};

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      confirmpassword: req.body.confirmpassword
    });

    const token = signToken(newUser._id.toString());
    (newUser as any).password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password!'
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
      return;
    }

    const token = signToken(user._id.toString());

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
      return;
    }

    const verifyAsync = promisify<string, string, JwtPayload>(jwt.verify as any);
    const decoded = await verifyAsync(token, process.env.JWT_SECRET as string);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
      return;
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      res.status(401).json({
        status: 'fail',
        message: 'User recently changed password! Please log in again.'
      });
      return;
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token or authorization failed.'
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
      return;
    }
    next();
  };
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'There is no user with that email address.'
      });
      return;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and confirmpassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({
        status: 'fail',
        message: 'There was an error sending the email. Try again later!'
      });
    }
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token as string)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired'
      });
      return;
    }

    user.password = req.body.password;
    user.confirmpassword = req.body.confirmpassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id.toString());

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (err) {
    next(err);
  }
};