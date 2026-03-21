import User from '../models/User.js'; 
import FriendRequest from '../models/FriendRequest.js'; 

export const getRecommendedUsers = async(req, res) => {
    try {
        const currentUserId = req.user._id; 
        const currentUser = req.user; 

        let recommendedUSers = await User.find({
            $and:[
                {_id: {$ne: currentUserId}},
                {_id: {$nin: currentUser.friends}},
                {isOnboarded: true}
            ]
        }).select('-password');

        res.status(200).json(recommendedUSers);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
} 

export const getMyFriends = async(req, res) => {
    try {
        const user = await User.findById(req.user._id) 
        .select('friends')
        .populate('friends', 'fullName profilePic nativeLanguage learningLanguage');

        // 'select' is not used here because it has only ids and we need to populate it to get the user details, for all othewr details (fullName, profilePic) we can use select in the populate method itself.

        if(!user){
            return res.status(404).json({message: 'User not found'}); 
        }
        res.status(200).json(user.friends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
} 

export const sendFriendRequest = async(req, res) => {
    try {
        const senderId = req.user._id; 
        const receiverId = req.params.id;

        if(senderId === receiverId){
            return res.status(400).json({message: 'You cannot send friend request to yourself'});
        } 

        const recipient = await User.findById(receiverId); 

        if(!recipient){
            return res.status(404).json({message: 'Recipient  not found'}); 
        }  

        if(recipient.friends.includes(senderId)){
            return res.status(400).json({message: 'You are already friends with this user'}); 
        }

        const existingRequest = await FriendRequest.findOne({
            $or:[
                {sender: senderId, recipient: receiverId},
                {sender: receiverId, recipient: senderId}
            ]
        });

        if(existingRequest){            
            return res.status(400).json({message: 'Friend request already exists between you and this user'}); 
        }

        const friendRequest = await FriendRequest.create({
            sender: senderId,
            recipient: receiverId
        }); 

        res.status(201).json(friendRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const acceptFriendRequest = async(req, res) => {
    try {
        const requestId = req.params.id; 
        const friendRequest = await FriendRequest.findById(requestId); 
        if(!friendRequest){
            return res.status(404).json({message: 'Friend request not found'}); 
        } 
        if(friendRequest.recipient.toString() !== req.user._id.toString()){
            return res.status(403).json({message: 'You are not authorized to accept this friend request'}); 
        } 
        friendRequest.status = 'accepted'; 
        await friendRequest.save(); 

        await User.findByIdAndUpdate(friendRequest.sender,{ $addToSet: {friends : friendRequest.recipient}}); 
        await User.findByIdAndUpdate(friendRequest.recipient,{ $addToSet: {friends : friendRequest.sender}});  
        res.status(200).json({message: 'Friend request accepted successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getFriendRequests = async(req, res) => {
    try {
        const incomingReqs = await FriendRequest.find({recipient: req.user._id, status: 'pending'})
        .populate('sender', 'fullName profilePic nativeLanguage learningLanguage'); 

        const acceptedReqs = await FriendRequest.find({sender: req.user._id, status: 'accepted'})
        .populate('recipient', 'fullName profilePic');

        res.status(200).json({ incomingReqs, acceptedReqs });

    } catch (error) {
        res.status(500).json({ message: error.message });  
    }
} 

export const getOutgoingFriendReqs = async(req, res) => {
    try {
        const outgoingReqs = await FriendRequest.find({sender : req.user._id, status: 'pending'})
        .populate('recipient', 'fullName profilePic nativeLanguage learningLanguage'); 

        if(!outgoingReqs){
            return res.status(404).json({message: 'No outgoing friend requests found'}); 
        }
        res.status(200).json(outgoingReqs); 

    } catch (error) {
        res.status(500).json({ message: error.message });  
    }
}