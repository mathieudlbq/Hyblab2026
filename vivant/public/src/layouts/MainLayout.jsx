import { Outlet } from 'react-router-dom';
import vivantOpenMedia from './../assets/Vivant-Open-Media.png'

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-end max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <img src={vivantOpenMedia} alt="Vivant Open Media" className='h-10 mt-4 mb-4'/>
      </div>
    </nav>
  );
};


const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
