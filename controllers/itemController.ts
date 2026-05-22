import { Request, Response, NextFunction } from 'express';

import Item from "../models/itemModel";

import User from "../models/userModel";

export const getAllItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await Item.find();

    res.status(200).json({
      status: 'success',
      results: items.length,
      data: { items }
    });
  } catch (err) {
    const error = err as Error;
    res.status(404).json({ status: 'fail', message: error.message });
  }
};

export const createItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newItem = await Item.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { item: newItem }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const buyItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const itemToBuy = await Item.findById(req.params.itemId);

    if (!itemToBuy) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }

    if (!user.inventory) {
      user.inventory = [];
    }

    if (user.gems === undefined) {
      user.gems = 0;
    }

    if (user.gems < itemToBuy.price) {
      res.status(400).json({ status: 'fail', message: 'Not enough gems!' });
      return;
    }

    user.gems -= itemToBuy.price;
    user.inventory.push(itemToBuy._id);

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        gems: user.gems,
        inventory: user.inventory
      }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};