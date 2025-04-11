import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import cors from "cors"

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";
import path from "path"

dotenv.config({ path: 'src/.env' }); //ye likhna jaruri dotenv ko use karne ke liye

// const app = express(); // ✅ Pehle initialize karo----iski jagh humne socket ka use kar liya

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));// ✅ Ab use karo
app.use(cookieParser()); // ye hume allow karta hai cookie ko parse karne me jisse ki hum cookies me se token findout kar sake iska use atuh.middleware me hai


//ye hum frontend ki request ko backend me approve krne ke liye likhte hai in easy words frontend ko backend se connect karne ke liye
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}))

const PORT = process.env.PORT;

const __dirname = path.resolve

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes)

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
}

server.listen(PORT, () => {
    console.log("your app is runing on port: " + PORT);
    connectDB();
});