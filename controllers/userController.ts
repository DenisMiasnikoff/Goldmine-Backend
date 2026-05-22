import { Request, Response, NextFunction } from 'express';

import User from "../models/userModel";

const filterObj = (obj: Record<string, unknown>, ...allowedFields: string[]): Record<string, unknown> => {
  const newObj: Record<string, unknown> = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getMe = (req: Request, res: Response, next: NextFunction): void => {
  req.params.id = req.user!.id;
  next();
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).populate('inventory');

    if (!user) {
      res.status(404).json({ message: 'No user found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    const error = err as Error;
    res.status(404).json({ status: 'fail', message: error.message });
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.body.password || req.body.confirmpassword) {
      res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updateMyPassword.'
      });
      return;
    }

    const filteredBody = filterObj(req.body, 'username', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user?.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const deleteMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.user?.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};