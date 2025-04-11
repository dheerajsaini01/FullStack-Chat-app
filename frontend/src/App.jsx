
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LogInPage from "./pages/LogInPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import {Loader} from "lucide-react"
import { Toaster } from "react-hot-toast";
import { Socket } from "socket.io-client";

function App() {
const {authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore()

console.log({onlineUsers})
// •	useAuthStore() se hum Zustand store se data le rahe hain.
// •	authUser: isme login user ka data hoga (jaise name, email, etc.)
// •	checkAuth: ek function hai jo backend se check karta hai ki user logged in hai ya nahi.



// Jab app open hoti hai, tab checkAuth() function run hota hai.
// •	Ye backend pe /auth/check wali API ko call karta hai.
// •	Agar user valid hai (token sahi hai), to user ka data milta hai.
// •	Ye useEffect ka use sirf 1 baar run karne ke liye hota hai — jab component mount hota hai.
useEffect(()=>{
  checkAuth();
}, [checkAuth]);

console.log({authUser});

if(isCheckingAuth && !authUser) return(
  <div className="flex items-center justify-center h-screen">
    <Loader className="size-10 animate-spin"/>
  </div>
) 

  return (
    <div data-theme="retro">
<Navbar/>
   
<Routes>
<Route path="/" element={authUser? <HomePage/>: <Navigate to="/login"/>}/>
<Route path="/signup" element={!authUser?<SignUpPage/>: <Navigate to="/"/>}/>
<Route path="/login" element={!authUser?<LogInPage/>: <Navigate to="/"/>}/>
<Route path="/settings" element={<SettingsPage/>}/>
<Route path="/profile" element={authUser?<ProfilePage/>: <Navigate to="/login"/>}/>

</Routes>

<Toaster/>
    </div>
  );
}

export default App;