import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'dev-data/config.env' });

import app from "./app";

const DB = process.env.DATABASE?.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD ?? ''
);

if (!DB) {
  throw new Error('DATABASE environment variable is not defined');
}

mongoose.connect(DB).then(() => {
  console.log('DB connection successful!');
});

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});