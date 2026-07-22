import mongoose, { Document, Schema, Query } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  photo: string;
  user: mongoose.Types.ObjectId;
  dungeon: mongoose.Types.ObjectId;
  
  upvotes: mongoose.Types.ObjectId[]; 
  downvotes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: [true, 'A post must have a title.'],
    trim: true,
    maxlength: [100, 'Title is too long!']
  },
  content: {
    type: String,
    required: [true, 'A post must have a content']
  },
  photo: {
    type: String,
    default: 'none'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A post must belong to someone.']
  },
  dungeon: {
    type: Schema.Types.ObjectId,
    ref: 'Dungeon',
    required: [true, 'A post must belong to its specific Dungeon!']
  },
  
  
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});


postSchema.index(
  { title: 'text', content: 'text' },
  { 
    weights: { title: 10, content: 2 }, 
    name: "TextSearchIndex" 
  }
);

postSchema.pre(/^find/, function(this: Query<IPost[], IPost>) {
  this.populate({
    path: 'user',
    select: 'username'
  }).populate({
    path: 'dungeon',
    select: 'name'
  });
});

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;