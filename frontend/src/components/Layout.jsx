import Sidebar from './Sidebar.jsx' 
import Navbar from './Navbar.jsx' 

function Layout({children, showSidebar = false}) {
  return (
    // The main wrapper locks exactly to the screen height
    <div className='h-screen flex overflow-hidden w-full'>
      
      {showSidebar && <Sidebar />} 
      
      {/* Right side column (Navbar + Content) */}
      <div className="flex flex-1 flex-col overflow-hidden w-full">
          <Navbar /> 
          
          {/* Because all parents are locked, this scrollbar will fit perfectly inside the window */}
          <main className='flex-1 overflow-y-auto'>
              {children}
          </main>
      </div>
      
    </div>
  )
}

export default Layout