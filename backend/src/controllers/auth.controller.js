//.......humne ye controller file sirf isliye bnaayi hai taki jo router file hai wo messy na ho ek acche folder structure ko create karne ke liye hum routes  ke function ko define karne ke controller file banate hai agr hum chahte toh inn sabhi ko auth.route.js me define kar sakte hai lekin phir wo ghic pich ho jata.......//

import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";



export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;  //ye body se req kare ga ki mujhe email dedo or password dedo or full name dede

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be atleast 6 characters" });
        }

        const user = await User.findOne({ email })
//ye kehna chahta haii ki pahle toh email dhundo or user me store krado agr aisa true hota hai toh email already exist hai
        if (user) return res.status(400).json({ message: "Email already exist" });

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword
        })


        if (newUser) {
            //generate jwt token here
            generateToken(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            })


        } else {
            res.status(400).json({ message: "Invalid user data " })
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body //ye body se req kare ga ki mujhe email dedo or password dedo

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid Credantials" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);  //bcrypt.compare() ek function hai jo plain text password (jo user ne abhi login ke time pe enter kiya) ko hashed password (jo database me save hai) se compare karta hai.

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credantials" })
        }

        generateToken(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic

        })

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })

    }
};


export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfuly" })
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
};

// export const updateProfile = async(req, res)=>{
// try {
//     console.log("before if check found profile pic", profilePic)
//      const {profilePic}=req.body;

//      const userId = req.user._id; //this is accessed only by the help of protect route function which is inside the auth middleware.js ye tabhi kaam karega jab user already login hai (because req.user._id tabhi milta hai).
// if(!profilePic){
//     return res.status(400).json({message:"Profile pic is required"})
// }
// console.log("found profile pic", profilePic)
// const uploadResponse = await cloudinary.uploader.upload(profilePic);//Socho: “Tumne apni photo studio ko image bheji, unhone bola: yeh rahi online photo link”
// const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true})

// res.status(200).json(updatedUser)


// } catch (error) {
//      console.log("error in update profile: ", error);
//      res.status(500).json({message:"Internal Server Error"})
// }



// auth.controller.js
// };


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;//this is accessed only by the help of protect route function which is inside the auth middleware.js ye tabhi kaam karega jab user already login hai (because req.user._id tabhi milta hai).

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// export const updateProfile = async (req, res) => {
//     try {
//       const { fullName, email } = req.body;
//       const profilePic = req.file; // this is your uploaded image

//       console.log("Profile Pic File:", profilePic);
//       console.log("Name:", fullName, "Email:", email);

//       // Ab yahan tu image ko cloudinary ya local storage mein save kar sakta hai

//       res.status(200).json({ success: true, message: "Profile updated!" });
//     } catch (err) {
//       console.error("Update error:", err);
//       res.status(500).json({ success: false, message: "Update failed" });
//     }
//   };






export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error " })
    }
}