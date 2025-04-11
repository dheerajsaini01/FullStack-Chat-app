import {create} from "zustand"; //Zustand ka function import kiya — jisse hum apna store bana sakte hain.
import { axiosInstance } from "../lib/axios";//Axios instance import kiya jisme pehle se base URL aur headers set honge. Isse hum easy API calls kar sakte hain.
import toast from "react-hot-toast";

 import {io} from "socket.io-client";
 const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api":"/"



//Ye ek Zustand store create kar raha hai jiska naam hai useAuthStore
//Ab tum kisi bhi component me const {authUser} = useAuthStore(); likh ke data use kar sakte ho.
export const useAuthStore = create((set, get)=>({
    authUser: null, //Login user ka data. Jab user login karta hai to yahan uska naam/email/image aa jaata hai.
    
//     Ye sab flags hain — loading state ke liye:
// 	•	Sign up ho raha hai ya nahi
// 	•	Login ho raha hai ya nahi
// 	•	Profile update ho rahi hai ya nahi
// ✅ Helpful for showing loaders/spinners in UI.
 isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,


//     Jab app open hoti hai, pehle check hota hai ki user logged in hai ya nahi. Tab tak loader dikhaya jaata hai (like splash screen).
// Default true hai, jaise hi check complete ho jaata hai — ye false ho jaata hai.
    isCheckingAuth: true, 
onlineUsers: [],
socket:null,

    // Ye ek async function hai jo backend se /auth/check API hit karta hai — check karne ke liye ki user login hai ya nahi.
    checkAuth: async ()=>{
        try {

            // Agar user valid token ke saath hai, to backend se user ka data milta hai aur authUser me save ho jaata hai.
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data });
            get().connectSocket()
            
        } catch (error) {
            console.log("Error in checkauth: ", error)
            set({authUser: null})
            // Agar token galat hai, expire ho gaya, ya koi aur issue hai, to user ko null set kar dete hain (matlab logout).
        }
        finally{
            // Chahe success ho ya fail — loader ko band karna hi hai. To end me isCheckingAuth: false kar dete hain.
            set({ isCheckingAuth: false});
        }
    },

    signup: async(data)=>{
     set({ isSigningUp: true});

     try {
        const res = await axiosInstance.post("/auth/signup", data);
        set({authUser: res.data});
        toast.success("Account created Successfully");
        get().connectSocket()
    } catch (error) {
        toast.error(error.response.data.message);
     }
     finally{
        set({isSigningUp:false});
     }


    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data });
          toast.success("Logged in successfully");
    
          get().connectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isLoggingIn: false });
        }
      },

    logout: async()=>{
        try{
            await axiosInstance.post("/auth/logout")
            set({authUser:null});
            toast.success("Logged out successfully")
            get().disconnectSocket()
        }
        catch(error){
            toast.error(error.response.data.message);
        }
    },

   updateProfile: async(data)=>{
        console.log("Sending this to backend:", data);
set({ isUpdatingProfile: true});
try {
    const res = await axiosInstance.put("/auth/update-profile",data);
    set({ authUser: res.data});
    toast.success("Profile updated successfully")
} catch (error) {
    console.log("error in updating profile: ",error);
    toast.error(error.response.data.message);
}finally{
    set({isUpdatingProfile: false})
}


    }, 

    connectSocket: ()=>{ 
        const {authUser} = get()
if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL)
        socket.connect()

        set({ socket:socket })

        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket.id);})


        // socket.on("getOnlineUsers", (userIds)=>{
        //     set({onlineUsers: userIds}); 
        // })


        socket.on("getOnlineUsers", (userIds) => {
            if (!Array.isArray(userIds)) return;
            console.log("🔵 Online users received:", userIds);
            set({ onlineUsers: userIds });
          });
    },
    disconnectSocket: ()=>{
if (get().socket?.connected) get().socket.disconnect();  
     }

}));