import {StreamChat} from 'stream-chat'; 
import "dotenv/config"; 

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET; 

if(!api_key || !api_secret){
    throw new Error('STREAM_API_KEY and STREAM_API_SECRET must be set in environment variables');
}

const streamClient = new StreamChat(api_key, api_secret); 

export const upsertStreamUser = async(userData) => {
    try {
        await streamClient.upsertUsers([userData]); 

        return userData; 
    } catch (error) {
        console.log("Error upserting Stream user:", error);
    }
}; 



export const generateStreamToken = (userId) => {
    try {
        const userIdStr = userId.toString(); 
        const token = streamClient.createToken(userIdStr); 
        return token;
    } catch (error) {
        console.log("Error generating Stream token:", error.message);
        throw error;
    }
} 