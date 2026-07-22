import { Request, Response, NextFunction } from 'express';
import Comment from '../models/commentModel';
import mongoose from 'mongoose';

export const getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comments = await Comment.find({ post: req.params.postId });

    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: { comments }
    });
  } catch (err) {
    const error = err as Error;
    res.status(404).json({ status: 'fail', message: error.message });
  }
};

export const createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newComment = await Comment.create({
      text: req.body.text,
      user: req.user!.id,
      post: req.params.postId as string  
    });

    res.status(201).json({
      status: 'success',
      data: { comment: newComment }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const upvoteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    const userId = req.user!.id;
    const hasUpvoted = comment.upvotes.some(id => id.toString() === userId);

    let message = '';

    if (hasUpvoted) {
      comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId);
      message = 'Upvote removed';
    } else {
      comment.upvotes.push(new mongoose.Types.ObjectId(userId));
      message = 'Upvoted!';
    }

    await comment.save();

    res.status(200).json({
      status: 'success',
      data: {
        upvotes: comment.upvotes.length,
        message
      }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};