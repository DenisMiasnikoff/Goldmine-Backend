import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  name: string;
  price: number;
  description: string;
  image: string;
  itemType: 'color' | 'frame';
  value: string;
  createdAt: Date;
}

const itemSchema = new Schema<IItem>({
  name: {
    type: String,
    required: [true, 'An item must have a name'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'An item must have a price']
  },
  description: {
    type: String,
    required: [true, 'An item must have a description']
  },
  image: {
    type: String,
    default: 'default-item.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  },
  itemType: {
  type: String,
  enum: ['color', 'frame'],
  required: [true, 'Item must have a type']
  },
 value: {
  type: String,
  required: [true, 'Item must have a value']
}
});

const Item = mongoose.model<IItem>('Item', itemSchema);

export default Item;