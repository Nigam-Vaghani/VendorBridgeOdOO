import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground relative z-0 overflow-hidden">
      {/* Global Decorative Background Blobs for Glass Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob z-[-1] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 z-[-1] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 z-[-1] pointer-events-none"></div>

      <div className="z-20 relative bg-background/80 backdrop-blur-md border-r border-border/50">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        <div className="bg-background/80 backdrop-blur-md border-b border-border/50 relative z-20">
          <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
