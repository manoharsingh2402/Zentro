import { useParams } from "react-router"; 
import { useAuthUser } from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query"; 
import { getStreamToken } from "../lib/api.js"; 
import { Channel, ChannelHeader, Chat, MessageInput, Window, MessageList, Thread } from "stream-chat-react"; 
import { StreamChat } from "stream-chat";
import { useEffect, useState } from "react";  
import toast from "react-hot-toast"; 
import ChatLoader from "../components/ChatLoader.jsx";  
import CallButton from "../components/CallButton.jsx";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

function ChatPage() {
  const { id: targetUserId } = useParams(); 
  const { authUser } = useAuthUser();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null); 
  const [loading, setLoading] = useState(true); 

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,  
    enabled: !!authUser, 
  }); 

  useEffect(() => {
    let isMounted = true; 
    const client = StreamChat.getInstance(STREAM_API_KEY);

    const initChat = async () => {  
      if (!tokenData?.token || !authUser) return;
      
      try {
        // FIX 1: Only connect if the user isn't already connected
        // This is crucial for when you return from the Call Page!
        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName, 
              image: authUser.profilePic,
            },
            tokenData.token
          );  
        }

        // FIX 2: Stop execution if React unmounted while we were connecting
        if (!isMounted) return;

        const channelId = [authUser._id, targetUserId].sort().join("-"); 

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        }); 

        await currChannel.watch();
        
        if (isMounted) {
          setChatClient(client); 
          setChannel(currChannel); 
        }
        
      } catch (error) {
        if (isMounted) {
          console.error("Error initializing chat:", error); 
          toast.error("Failed to initialize chat. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false); 
        }
      }
    };

    initChat();

    // FIX 3: Do NOT disconnect the user here! 
    // Just flag the component as unmounted so we don't update state on a dead page.
    return () => {
      isMounted = false; 
    };
  }, [tokenData, authUser, targetUserId]); 

  if (loading || !chatClient || !channel) {
    return <ChatLoader />; 
  } 

  const handleVideoCall = () => {
    if(channel){
      const callUrl = `${window.location.origin}/call/${channel.id}`; 

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      }); 

      toast.success("Video call link sent successfully!");
    }
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}> 
          <div className="w-full relative"> 
            <CallButton handleVideoCall={handleVideoCall} /> 
            <Window>
              <ChannelHeader />
              <MessageList /> 
              <MessageInput focus />
            </Window>
          </div> 
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}

export default ChatPage;