import {useState} from 'react' 
import { useAuthUser } from '../hooks/useAuthUser.js'
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeOnboarding } from '../lib/api.js'  
import {CameraIcon, ShuffleIcon} from 'lucide-react'  
import { LANGUAGES } from '../constants/index.js'   
import { MapPinIcon,ShipWheelIcon, LoaderIcon } from 'lucide-react' 

function OnboardingPage() { 
  const { authUser } = useAuthUser(); 

  const [formState, setFormState] = useState({
    fullName: authUser?.name || '',
    bio: authUser?.bio || '',
    nativeLanguage: authUser?.nativeLanguage || '', 
    learningLanguage: authUser?.learningLanguage || '', 
    location: authUser?.location || '', 
    profilePic: authUser?.profilePic || '',   
  });  

  const queryClient = useQueryClient(); 

  const {mutate: onboardingMutation, isPending, error} = useMutation({
    mutationFn: completeOnboarding, 
    onSuccess: () =>{ 
      toast.success('Profile onboarded successfully!');
      queryClient.invalidateQueries({queryKey: ['authUser']}); 
    },
    onError: (error) =>{
      toast.error(error.response?.data?.message || 'Error occurred during onboarding');
    }
  }); 

  const handleOnboarding = (e) => {
    e.preventDefault(); 
    onboardingMutation(formState); 
  } 

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 150)+1; 
    const randomAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${idx}&size=150`;
    setFormState(prev => ({...prev, profilePic: randomAvatar}));  
    toast.success("Avatar changed successfully"); 
  }

  return (
    <div className='min-h-screen bg-base-100 flex items-center justify-center p-4'>
      <div className='card bg-base-200 w-full max-w-3xl shadow-xl'> 
        <div className='card-body p-6 sm:p-8'>
          <h1 className='text-2xl sm:text-3xl font-bold text-center mb-6'>Complete Your Profile</h1>
        
          <form onSubmit={handleOnboarding} className='space-y-4'>
            {/* profile-pic  container*/}
            <div className='flex flex-col items-center justify-center p-4'>  
              {/* IMAGE-PREVIEW */}
              <div className='size-32 rounded-full bg-base-300 overflow-hidden'> 
                {formState.profilePic ? (
                  <img src={formState.profilePic} alt="Profile" className='w-full h-full object-cover' />
                ) : (
                  <div className='h-full flex items-center justify-center '>
                    <CameraIcon className='size-12 opacity-40 text-base-content' />
                  </div>
                )}
              </div>

              {/* GENERATE RANDOM AVATAR BTN  */}
              
              <div className='flex items-center gap-2'>
                <button
                  type="button"
                  onClick={handleRandomAvatar}
                  className="btn btn-accent"
                >
                  <ShuffleIcon className='size-4 mr-2' /> 
                  Generate Random Avatar 
                </button>
              </div> 

            </div>  

            {/* FULL-NAME */} 

              <div className="form-control">
                <label className='label'>
                  <span className='label-text'>
                    Full Name
                  </span>
                </label>
                <input 
                  type="text" 
                  placeholder="Your Full Name"  
                  className='input input-bordered w-full'
                  name="fullName"
                  value={formState.fullName}
                  onChange={(e) => setFormState(formState => ({...formState, fullName: e.target.value}))}
                />
              </div> 

              {/* BIO */}

              <div className="form-control">
                <label className='label'>
                  <span className='label-text'>
                    Bio
                  </span>
                </label>
                <textarea
                  type="text" 
                  placeholder="Tell others about yourself and your learning goals"  
                  className='textarea textarea-bordered h-24'
                  name="bio"
                  value={formState.bio}
                  onChange={(e) => setFormState(formState => ({...formState, bio: e.target.value}))}
                />
              </div>   

            {/* LANGUAGES */} 

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NATIVE-LANGUAGE */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Native Language</span>
                </label>
                <select 
                  name="nativeLanguage" 
                  className="select select-bordered w-full"
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState(formState => ({...formState, nativeLanguage: e.target.value}))}
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* LEARNING-LANGUAGE */} 
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Learning Language</span>
                </label>
                <select 
                  name="learningLanguage" 
                  className="select select-bordered w-full"
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState(formState => ({...formState, learningLanguage: e.target.value}))}
                >
                  <option value="">Select your learning language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

            </div> 

            {/* LOCATION */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <div className="relative">
                <MapPinIcon className='absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70'/> 
                <input 
                  type="text" 
                  placeholder="City, Country"  
                  className='input input-bordered w-full pl-10'
                  name="location"
                  value={formState.location}
                  onChange={(e) => setFormState(formState => ({...formState, location: e.target.value}))}
                />
              </div>
            </div> 
            
            {/* SUBMIT BTN */}
            
            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              disabled={isPending}
            >
              {!isPending ?(
                <>
                 <ShipWheelIcon className="size-5 mr-2"/> 
                 Complete Onboarding                
                </>
              ):(
                <>
                  <LoaderIcon className='animate-spin size-5 mr-2' />  
                  Onboarding...
                </>
              )}
            </button>
            

          </form> 
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
