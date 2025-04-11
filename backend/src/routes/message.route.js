import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUserForSidebar, getMessages, sendMessage } from "../controllers/message.controller.js";

const router  = express.Router();



router.get("/users",protectRoute, getUserForSidebar) //for fetching the users in sidebar

router.get("/:id", protectRoute, getMessages) //for fetching the chat of the user by clicking on it

router.post("/send/:id", protectRoute, sendMessage)
export default router;