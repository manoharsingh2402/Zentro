import User from '../models/User.js'; 
import jwt from 'jsonwebtoken'; 
import { upsertStreamUser } from '../lib/stream.js';

export const signup = async(req, res) => {
    const {fullName,email,password} = req.body; 
    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message: 'Please provide all required fields'}); 
        } 
        if(password.length < 6){
            return res.status(400).json({message: 'Password must be at least 6 characters'}); 
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        if(!emailRegex.test(email)){
            return res.status(400).json({message: 'Invalid email format'}); 
        }

        const existingUser = await User.findOne({email}); 
        if(existingUser){
            return res.status(400).json({message: 'User already exists'}); 
        } 

        const idx = Math.floor(Math.random() * 70)+1; 

        const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${idx}&size=150`;

        const newUser = await User.create({fullName,email,password,profilePic: randomAvatar});  

        // TODO: create user in STREAM as well
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || ""
            }); 
            console.log("Stream user created/updated successfully");
        } catch (error) {
            console.error("Error creating Stream user:", error);
        }

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {expiresIn: '7d'});

        res.cookie('jwt', token, {
            httpOnly: true, // prevent XSS attacks
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'strict' // prevent CSRF attacks
        });

        res.status(201).json({success: true, user: newUser}); 

    } catch (error) {
        res.status(500).json({message: 'Error occurred while signing up'}); 
    }
} 

export const login = async(req, res) => {
    const {email, password} = req.body; 
    try {
        if(!email || !password){
            return res.status(400).json({message: 'Please provide all required fields'}); 
        }
        const user = await User.findOne({email}); 
        if(!user){
            return res.status(400).json({message: 'User does not exist'}); 
        }

        const isMatch = await user.matchPassword(password); 

        if(!isMatch){
            return res.status(400).json({message: 'Invalid email or password'}); 
        } 

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '7d'});

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict' 
        });

        res.status(200).json({success: true, user});

    } catch (error) {
        res.status(500).json({message: 'Error occurred while logging in'}); 
    }
}

export const logout = async(req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({success: true, message: 'Logged out successfully'});
}

export const onboard = async(req, res) => {
    
    try {
        const userId = req.user._id; 
        const {fullName,bio,nativeLanguage,learningLanguage,location} = req.body; 

        if(!fullName || !nativeLanguage || !learningLanguage || !location){
            return res.status(400).json({message: 'All fields are required'},{missingDetails: [
                !fullName && 'fullName',
                !nativeLanguage && 'nativeLanguage',
                !learningLanguage && 'learningLanguage',
                !location && 'location'
            ]}); 
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true
        }, {new: true});

        if(!updatedUser){
            return res.status(404).json({message: 'User not found'}); 
        }    

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || ""
            }); 

            console.log(`Stream user updated successfully for user ${updatedUser.fullName}`);

        } catch (streamError) {
            console.error("Error updating Stream user:", streamError);
        }

        res.status(200).json({success: true, user: updatedUser});

    } catch (error) {
        res.status(500).json({message: 'Error occurred while onboarding'}); 
    }

}