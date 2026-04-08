import { useState } from "react";
import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  
  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Transactions", path: "/transactions" },
  ];

  return (
    <header className="flex flex-col bg-black border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-black/80">
      <div className="flex justify-between items-center px-4 md:px-8 py-4 w-full">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 bg-[#00E599] rounded-sm flex items-center justify-center shadow-[0_0_10px_rgba(0,229,153,0.3)]">
            <span className="text-black font-extrabold text-sm leading-none">F</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white uppercase">FinMate</h1>
        </Link>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-[#00E599] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="scale-90 md:scale-100">
              <UserButton afterSignOutUrl="/" />
            </div>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex flex-col gap-1.5 cursor-pointer p-2 hover:bg-white/5 transition-colors"
            >
               <motion.div 
                 animate={isOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                 className="w-5 h-0.5 bg-[#00E599]" 
               />
               <motion.div 
                 animate={isOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                 className="w-5 h-0.5 bg-[#00E599]" 
               />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-[#050505] overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold uppercase tracking-[0.3em] text-[#9B9B9B] hover:text-[#00E599] transition-colors"
                >
                  &gt; {link.name}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
