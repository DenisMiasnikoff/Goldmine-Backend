import mongoose, { Document, Schema, Model, Query } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 1. Document fields interface
export interface IUser extends Document {
  username: string;
  id:string;
  email: string;
  photo?: string;
  role: 'user' | 'moderator' | 'admin';
  password: string;
  confirmpassword?: string;
  passwordchangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;
  gems: number;
  userProfile: {
    wallpaper: string;
    avatarFrame: string;
    unlockedWallpapers: string[];
    unlockedFrames: string[];
  };
  inventory: mongoose.Types.ObjectId[];
  subscriptions: mongoose.Types.ObjectId[];
}

// 2. Custom methods interface
interface IUserMethods {
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  changedPasswordAfter(JWTTimestamp: number): boolean;
}

// 3. Combined model type
type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    required: [true, 'Username field required!']
  },
  email: {
    type: String,
    required: [true, 'Please provide valid email address!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Provide a valid email address.']
  },
  photo: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide password, minimum-length: 8'],
    minlength: 8,
    select: false
  },
  confirmpassword: {
    type: String,
    required: [true, 'Please confirm your password, type exact same one.'],
    validate: {
      validator: function(this: IUser, el: string) {
        return el === this.password;
      },
      message: 'Passwords are not the same.'
    }
  },
  passwordchangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  gems: {
    type: Number,
    default: 100,
    min: [0, 'User cannot have negative currency']
  },
  userProfile: {
    wallpaper: { type: String, default: 'none' },
    avatarFrame: { type: String, default: 'none' },
    unlockedWallpapers: { type: [String], default: ['none'] },
    unlockedFrames: { type: [String], default: ['none'] }
  },
  inventory: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Item'
    }],
    default: []
  },
subscriptions: {
  type: [{
    type: Schema.Types.ObjectId,
    ref: 'Dungeon'
  }],
  default: []
}
});

// Pre-save middleware
userSchema.pre('save', async function(this: IUser) {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmpassword = undefined;
});

// Pre-find middleware
userSchema.pre(/^find/, function(this: Query<IUser[], IUser>) {
  this.find({ active: { $ne: false } });
});

// Methods
userSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function(this: IUser): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

userSchema.methods.changedPasswordAfter = function(
  this: IUser,
  JWTTimestamp: number
): boolean {
  if (this.passwordchangedAt) {
    const changedTimestamp = parseInt(
      String(this.passwordchangedAt.getTime() / 1000),
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;