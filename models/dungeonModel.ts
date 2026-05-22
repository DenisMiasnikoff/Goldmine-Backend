import mongoose, { Document, Schema } from 'mongoose';

// Describes what a Dungeon document looks like
export interface IDungeon extends Document {
  name: string;
  description?: string;
  moderators: mongoose.Types.ObjectId[];
  createdAt: Date;
  dungPicture: string;
  dungBanner: string;
}

const dungeonSchema = new Schema<IDungeon>(
  {
    name: {
      type: String,
      required: [true, 'A subreddit must have a name'],
      unique: true,
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [21, 'Name must be less than 24 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters.']
    },
    moderators: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    },
    dungPicture: {
      type: String,
      default: 'none'
    },
    dungBanner: {
      type: String,
      default: 'none'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Dungeon = mongoose.model<IDungeon>('Dungeon', dungeonSchema);

export default Dungeon;