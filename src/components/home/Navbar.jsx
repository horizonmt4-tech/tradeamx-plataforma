import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { scrollToSection } from '@/lib/utils';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', to: '/', type: 'link' },
    { name: 'PLANES', to: '#pricing-section', type: 'scroll' },
    { name: 'Contacto', to: '/contact', type: 'link' },
  ];

  if (currentUser) {
    navItems.push({ name: 'Dashboard', to: '/dashboard', type: 'link' });
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    closeMobileMenu();
  };

  const handleNavClick = (e, item) => {
    if (item.type === 'scroll') {
      e.preventDefault();
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: item.to.replace('#', '') } });
      } else {
        scrollToSection(item.to.replace('#', ''));
      }
      closeMobileMenu();
    } else {
      closeMobileMenu();
    }
  };

  return (
    // FIX iOS: paddingTop con safe-area-inset-top para respetar el notch / Dynamic Island
    <nav
      className="fixed top-0 w-full z-50 glass-effect border-b border-white/5 bg-[#0a0f1a]/95 backdrop-blur-md transition-all duration-300"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        height: 'calc(5rem + env(safe-area-inset-top))',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20">
        <div className="flex justify-between items-center h-full">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center" onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              closeMobileMenu();
            }}>
              {/* FIX: logo local en /public en vez de la URL de horizons-cdn.hostinger.com
                  que dejó de existir (404) tras migrar el proyecto fuera del builder */}
              <img
                src="/IMG-20260210-WA0040.jpg"
                alt="TradeAMX - Funding Tomorrow's Traders"
                className="h-10 md:h-12 w-auto object-contain"
              />
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                {item.type === 'scroll' ? (
                  <a
                    href={item.to}
                    onClick={(e) => handleNavClick(e, item)}
                    className="text-gray-300 hover:text-[#d4af37] transition-colors cursor-pointer text-sm font-bold uppercase tracking-wide"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    onClick={(e) => handleNavClick(e, item)}
                    className="text-gray-300 hover:text-[#d4af37] transition-colors cursor-pointer text-sm font-bold uppercase tracking-wide"
                  >
                    {item.name}
                  </Link>
                )}
              </motion.div>
            ))}

            <div className="flex items-center gap-3">
              {!currentUser ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link to="/login">
                      <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link to="/register">
                      <Button className="bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold shadow-lg shadow-yellow-900/20">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up
                      </Button>
                    </Link>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-2"
                >
                  <Link to="/dashboard">
                    <Button variant="outline" className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleSignOut} className="text-gray-300 hover:text-red-400 hover:bg-white/10">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            {currentUser && (
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="text-[#d4af37]">
                  <LayoutDashboard className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-white hover:bg-white/10">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden absolute left-0 right-0 bg-[#0f172a] border-b border-gray-800 shadow-2xl"
            style={{ top: 'calc(5rem + env(safe-area-inset-top))' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col p-4 space-y-4">
              {navItems.map((item) => (
                <React.Fragment key={item.name}>
                  {item.type === 'scroll' ? (
                    <a
                      href={item.to}
                      onClick={(e) => handleNavClick(e, item)}
                      className="text-gray-300 hover:text-[#d4af37] transition-colors text-base font-bold py-3 px-4 rounded-md hover:bg-white/5 uppercase border-l-2 border-transparent hover:border-[#d4af37]"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      to={item.to}
                      onClick={(e) => handleNavClick(e, item)}
                      className="text-gray-300 hover:text-[#d4af37] transition-colors text-base font-bold py-3 px-4 rounded-md hover:bg-white/5 uppercase border-l-2 border-transparent hover:border-[#d4af37]"
                    >
                      {item.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
              <div className="pt-4 border-t border-gray-800 grid grid-cols-1 gap-3">
                {!currentUser ? (
                  <>
                    <Link to="/login" onClick={closeMobileMenu}>
                      <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 hover:border-gray-600 h-12 text-lg">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={closeMobileMenu}>
                      <Button className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold h-12 text-lg">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button onClick={handleSignOut} variant="destructive" className="w-full h-12 text-lg">
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
