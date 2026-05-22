import { Request, Response, NextFunction } from 'express';

import Post from "../models/postModel";

import User from "../models/userModel";

interface PostFilter {
  dungeon?: string;
}

export const getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: PostFilter = {};
    if (req.params.dungeonId) filter.dungeon = req.params.dungeonId as string;

    const posts = await Post.find(filter);

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts }
    });
  } catch (err) {
    const error = err as Error;
    res.status(404).json({ status: 'fail', message: error.message });
  }
};

export const createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.body.dungeon) req.body.dungeon = req.params.dungeonId;
    if (!req.body.user) req.body.user = req.user?.id;

    const newPost = await Post.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { post: newPost }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const getPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: 'No post found with that ID' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { post }
    });
  } catch (err) {
    const error = err as Error;
    res.status(404).json({ status: 'fail', message: error.message });
  }
};

export const upvotePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.user.toString() === req.user?.id) {
      res.status(400).json({ message: 'You cannot upvote your own post!' });
      return;
    }

    post.upvotes = post.upvotes + 1;
    await post.save();

    let message = 'Upvoted!';

    if (post.upvotes % 10 === 0) {
      const author = await User.findById(post.user);

      if (author) {
        author.gems = author.gems + 5;
        await author.save({ validateBeforeSave: false });
        message = `Upvoted! This was the ${post.upvotes}th like. Author earned a gemstone! 💎`;
      }
    }

    res.status(200).json({
      status: 'success',
      data: { upvotes: post.upvotes, message }
    });
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};