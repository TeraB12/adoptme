import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT||8080;

if(!process.env.MONGO_URL||!process.env.JWT_SECRET){
    console.error('Faltan variables de entorno, revisar el archivo .env');
    process.exit(1);
}

await mongoose.connect(process.env.MONGO_URL);

app.listen(PORT,()=>console.log(`Listening on ${PORT}`))
