  import User from "../models/user.model.js"
  import Message from "../models/message.model.js"
  import cloudinary from "../lib/cloudinary.js";
  import { getReceiverSocketId, io } from "../lib/socket.js";
  export const getUserForSidebar = async(req, res)=>{
try {
    //Jab tu login karta hai, toh tu apne aap ko sidebar me nahi dekhna chahta — sirf baaki log.
    const loggedInUserId = req.user._id; //req.user._id se tu apna ID nikaal raha hai
    const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}) //Jab tu login karta hai, toh tu apne aap ko sidebar me nahi dekhna chahta — sirf baaki log.means:
//“Mujhe saare users laa do jinka ID mere ID se different hai”
    
//here $ne stansds for not equals to
    res.status(200).json(filteredUsers);
} catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({error: "Internal server error"}); 
}
  }

export const getMessages = async(req, res)=>{
     try {
        const { id:userToChatId } = req.params //{ id:userToChatId } it means changing the name of id to userToChatId
        const myId = req.user._id;
        // Yahan tu message fetch kar raha hai:
        // •	Tere ID: myId
        // •	Jisse tu chat kar raha hai uska ID: userToChatId



        const messages = await Message.find({
            $or:[
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ] //this will find all the messages between us
        })
    //     yeh bol raha hai: “Mujhe woh messages laa do jahan:
    //     •	Ya to main sender hoon aur wo receiver hai
    //     •	Ya to wo sender hai aur main receiver hoon”
    // Iska matlab: tum dono ke beech ke saare messages (tumne bheje ho ya usne) mil jaayenge.

     res.status(200).json(messages)

     } catch (error) {
        console.log("Error in getMessagesController: ", error.message);
        res.status(500).json({error: "Internal server error"});
     }
}
   
export const sendMessage = async(req, res)=>{
    try {
        const {text, image} = req.body;
        const { id:receiverId } = req.params; //ye dost ki id hogi
        const senderId = req.user._id // ye meri id hogi

        let imageUrl;
        if(image){

            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        
const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image:imageUrl,
});

await newMessage.save(); 

 
const receiverSocketId = getReceiverSocketId(receiverId);
if(receiverSocketId){
    io.to(receiverSocketId).emit("newMessage", newMessage)
}


res.status(200).json(newMessage)   
    } catch (error) {
        console.log("Error in sendMessages Controller: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}