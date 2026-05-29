import { Request, Response, NextFunction } from 'express';

import Post from "../models/postModel";

import User from "../models/userModel";
import mongoose from 'mongoose';

interface PostFilter {
  dungeon?: string;
}

export const getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: PostFilter = {};
    if (req.params.dungeonId) filter.dungeon = req.params.dungeonId as string;

    const isPopular = req.query.sort === 'popular';

    const sortBy = req.query.sort === 'popular';

    let posts;
   if (sortBy) {
     posts = await Post.aggregate([
    { $addFields: { upvoteCount: { $size: '$upvotes' } } },
    { $sort: { upvoteCount: -1 } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'dungeons',
        localField: 'dungeon',
        foreignField: '_id',
        as: 'dungeon'
      }
    },
    { $unwind: '$dungeon' }
  ]);
} else {
  posts = await Post.find(filter).sort({ createdAt: -1 });
}

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

    const userId = req.user?.id;

    
    if (!userId) {
      res.status(401).json({ message: 'You must be logged in to upvote.' });
      return;
    }

    let message = '';
    const hasUpvoted = post.upvotes.some(id => id.toString() === userId.toString());

    if (hasUpvoted) {
    
      post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
      message = 'Upvote removed';
    } else {
    
      post.upvotes.push(new mongoose.Types.ObjectId(userId));
      message = 'Upvoted!';

      const currentVoteCount = post.upvotes.length;
      if (currentVoteCount > 0 && currentVoteCount % 10 === 0) {
        const author = await User.findById(post.user);

        if (author) {
          author.gems = (author.gems || 0) + 5;
          await author.save({ validateBeforeSave: false });
          message = `Upvoted! This was the ${currentVoteCount}th like. Author earned 5 gemstones! 💎`;
        }
      }
    }

  
    await post.save();

    res.status(200).json({
      status: 'success',
      data: {
        upvotes: post.upvotes.length,
        message
      }
    });

 
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const searchPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ 
        status: 'fail', 
        message: 'Please provide a valid search term in the "q" query parameter.' 
      });
      return;
    }

    
    const posts = await Post.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } } 
    )
    .sort({ score: { $meta: 'textScore' } }) 
    .limit(20); 

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: { posts }
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ status: 'fail', message: error.message });
  }
};