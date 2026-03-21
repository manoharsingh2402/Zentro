import { useLocation,Link } from "react-router" 
import { useAuthUser } from "../hooks/useAuthUser.js"; 
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {logout} from '../lib/api.js'  
import { BellIcon,LogOutIcon,ShipWheelIcon } from "lucide-react"; 
import ThemeSelector from "./ThemeSelector.jsx";
function Navbar() {
  const location = useLocation();
  const {authUser} = useAuthUser(); 
  const queryClient = useQueryClient();  
  const isChatPage = location.pathname.startsWith('/chat');

  const {mutate: logoutMutation,isPending,error}=    useMutation({
      mutationFn: logout, 
      onSuccess: () => queryClient.invalidateQueries({queryKey: ['authUser']}),
  }); 


  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex items-center justify-end w-full">
          
          {/* LOGO - ONLY IN THE CHAT PAGE */} 

          {isChatPage &&(
            <div className="pl-5">
              <Link to="/" className="flex items-center gap-2.5"> 
              <ShipWheelIcon className="size-9 text-primary" />
              <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">Zentro</span>
              </Link>
            </div>
          )} 

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="size-6 text-base-content opacity-70" />
              </button>
            </Link>
          </div>

          <ThemeSelector /> 

          <div className="avatar">
            <div className="w-9 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>

          {/* LOGOUT BUTTON */}
          <button onClick={logoutMutation} className="btn btn-ghost btn-circle">
            <LogOutIcon className="size-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar
