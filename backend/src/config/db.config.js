@"
import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  if (!env.MONGO_URI) return;
  await mongoose.connect(env.MONGO_URI, { autoIndex: true });
  console.log('[db] connected');
};

await connectDB().catch(err => {
  console.error('[db] connection error:', err.message);
  process.exit(1);
});
"@ | Set-Content src/config/db.config.js
