import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js"; //local files ke liye .js lagana jruri hota hai
 import { protectRoute} from "../middleware/auth.middleware.js";
 import { updateProfile } from "../controllers/auth.controller.js";
 import { checkAuth } from "../controllers/auth.controller.js";
const router = express.Router();

// router.post("/signup", (req, res)=>{
//     res.send("signup route")
// })  agar yahi par sign up ka logic define krte toh structure aisa hota lekin humne controller file me sign up ka logic define kar diya hai toh signup wala route hum yaha ase likhe ge 

router.post("/signup", signup) //ab humne simply signup ko yaha import karke call kr liya ab ye messy ni hua

router.post("/login", login);



router.post("/logout", logout) 

router.put("/update-profile", protectRoute, updateProfile)

router.get("/check", protectRoute, checkAuth)
export default router; 