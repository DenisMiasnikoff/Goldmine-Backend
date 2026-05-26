import { Request, Response, NextFunction } from 'express';

import Dungeon from "../models/dungeonModel"
import User from '../models/userModel';
import mongoose from 'mongoose';

export const getAllDungeons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dungeons = await Dungeon.find();
    res.status(200).json({
      status: 'success',
      results: dungeons.length,
      data: { dungeons }
    });
  } catch (err) {
    const error = err as Error;
    res.status(404).json({ status: 'fail', message: error.message });
  }
};

export const createDungeon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newDungeon = await Dungeon.create({
      name: req.body.name,
      description: req.body.description,
      dungPicture: req.body.dungPicture,
      dungBanner: req.body.dungBanner,
      moderators: [req.user!.id]
    });

    res.status(201).json({
      status: 'success',
      data: { dungeon: newDungeon }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const getDungeon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dungeon = await Dungeon.findById(req.params.id).populate('moderators');

    if (!dungeon) {
      res.status(404).json({ message: 'No dungeon found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { dungeon }
    });
  } catch (err) {
    const error = err as Error;
    res.status(404).json({ status: 'fail', message: error.message });
  }
};

export const subscribeToDungeon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const dungeonId = new mongoose.Types.ObjectId(req.params.id as string);
    const isSubscribed = user.subscriptions.some(
      id => id.toString() === req.params.id
    );

    let message = '';
    if (isSubscribed) {
      user.subscriptions = user.subscriptions.filter(
        id => id.toString() !== req.params.id
      );
      message = 'Unsubscribed';
    } else {
      user.subscriptions.push(dungeonId);
      message = 'Subscribed!';
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: { message, subscriptions: user.subscriptions }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const getMyDungeons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).populate('subscriptions');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { dungeons: user.subscriptions }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};