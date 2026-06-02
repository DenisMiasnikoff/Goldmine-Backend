import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
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

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || '90d';
  return jwt.sign({ id }, secret, { expiresIn } as SignOptions);
};

const sendTokenCookie = (res: Response, token: string) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 90 * 24 * 60 * 60 * 1000,
  });
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

    sendTokenCookie(res, token);

    res.status(201).json({
      status: 'success',
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
      res.status(400).json({ status: 'fail', message: 'Please provide email and password!' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
      return;
    }

    const token = signToken(user._id.toString());
    sendTokenCookie(res, token);

    res.status(200).json({ status: 'success' });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ status: 'fail', message: 'You are not logged in!' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      res.status(401).json({ status: 'fail', message: 'User no longer exists.' });
      return;
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      res.status(401).json({ status: 'fail', message: 'Password recently changed. Please log in again.' });
      return;
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ status: 'fail', message: 'Invalid token.' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      res.status(403).json({ status: 'fail', message: 'You do not have permission.' });
      return;
    }
    next();
  };
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({ status: 'fail', message: 'No user with that email.' });
      return;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Points to frontend reset page, not API
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const message = `Forgot your password? Go here to reset it: ${resetURL}\nIf you didn't request this, ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });
      res.status(200).json({ status: 'success', message: 'Token sent to email!' });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ status: 'fail', message: 'Error sending email. Try again later.' });
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
      res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired.' });
      return;
    }

    user.password = req.body.password;
    user.confirmpassword = req.body.confirmpassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id.toString());
    sendTokenCookie(res, token);

    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};