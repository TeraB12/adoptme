import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT||8080;

await mongoose.connect(process.env.MONGO_URL);

app.listen(PORT,()=>console.log(`Listening on ${PORT}`))
