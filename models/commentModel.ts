import mongoose, { Document, Schema, Query } from 'mongoose';

export interface IComment extends Document {
  text: string;
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  upvotes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  text: {
    type: String,
    required: [true, 'Comment cannot be empty'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment must belong to a user']
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Comment must belong to a post']
  },
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

commentSchema.pre(/^find/, function(this: Query<IComment[], IComment>) {
  this.populate({
    path: 'user',
    select: 'username'
  });
});

const Comment = mongoose.model<IComment>('Comment', commentSchema);
export default Comment;