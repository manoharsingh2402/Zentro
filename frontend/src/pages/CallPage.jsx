import { useState, useEffect } from "react"; 
import { useParams, useNavigate } from "react-router"; 
import { useAuthUser } from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api.js"; 

import { StreamVideo, StreamVideoClient, StreamCall, CallControls, SpeakerLayout, StreamTheme, CallingState, useCallStateHooks } from "@stream-io/video-react-sdk";  

import "@stream-io/video-react-sdk/dist/css/styles.css";  
import PageLoader from "../components/PageLoader.jsx";  
import toast from 'react-hot-toast';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

function CallPage() { 

  const {id:callId} = useParams(); 
  const { authUser, isLoading } = useAuthUser();

  const [client, setClient] = useState(null); 
  const [call, setCall] = useState(null);  
  const [isConnecting, setIsConnecting] = useState(true); 

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,  
    enabled: !!authUser, 
  }); 
  
  useEffect(() =>{
    const initCall = async () => {
      if(!tokenData?.token || !authUser || !callId){
        return;
      } 
      try {
        console.log("Initializing video call with token:", tokenData.token); 

        const user ={
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        }

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);  
        await callInstance.join({create: true});
        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        toast.error("Failed to initialize video call. Please try again.");
        console.error("Call initialization error:", error);
      }
      finally{
        setIsConnecting(false); 
      }
    }; 

    initCall();
     
  }, [tokenData, authUser, callId]);

  if(isLoading || !authUser || isConnecting){
    return <PageLoader />;
  }
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ?(
          <StreamVideo client={client}>
            <StreamCall call={call}> 
              <CallContent callId={callId} authUser={authUser} />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Couldn't initialize video call. Refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  )
} 

const CallContent = ({ callId, authUser }) => {
  const { useCallCallingState } = useCallStateHooks(); 
  const callingState = useCallCallingState(); 
  const navigate = useNavigate(); 

  // FIX: Wrap the navigation in a useEffect
  useEffect(() => { 
    // callId -> id1-id2 

    const id1 = callId.split("-")[0].toString();
    const id2 = callId.split("-")[1].toString();  

    const currentUserId = authUser._id.toString(); 

    const targetUserId = currentUserId === id1 ? id2 : id1; 

    if (callingState === CallingState.LEFT) {
      navigate(`/chat/${targetUserId}`);
    } 

  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout /> 
      <CallControls />
    </StreamTheme>
  ); 
};

export default CallPage
