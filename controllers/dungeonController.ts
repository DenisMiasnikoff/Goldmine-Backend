import { Request, Response, NextFunction } from 'express';

import Dungeon from "../models/dungeonModel"

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