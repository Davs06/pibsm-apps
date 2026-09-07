import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Moon, Sun, Menu, X, LogIn, LogOut } from 'lucide-react';

const Navbar = ({ user, onLoginClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Dark Mode Logic
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-cream/90 dark:bg-dark/90 border-b border-gold/20 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3" onClick={closeMenu}>
            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
            <span className="font-semibold text-lg hidden sm:block text-dark dark:text-cream">
              Calendário
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`font-medium transition-colors hover:text-gold ${location.pathname === '/' ? 'text-gold' : 'text-dark dark:text-cream'}`}
            >
              Visão Mensal
            </Link>
            <Link
              to="/semana"
              className={`font-medium transition-colors hover:text-gold ${location.pathname === '/semana' ? 'text-gold' : 'text-dark dark:text-cream'}`}
            >
              Próximos 7 Dias
            </Link>
          </div>

          {/* Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-dark dark:text-cream"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-dark/70 dark:text-cream/70">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors font-medium text-sm"
                >
                  <LogOut size={16} /> Sair
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold/90 text-dark rounded-lg transition-colors font-medium text-sm shadow-md"
              >
                <LogIn size={16} /> Admin
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-dark dark:text-cream"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-dark dark:text-cream hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gold/10 bg-cream dark:bg-dark absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link
              to="/"
              onClick={closeMenu}
              className={`block px-3 py-3 rounded-md text-base font-medium ${location.pathname === '/' ? 'bg-gold/10 text-gold' : 'text-dark dark:text-cream hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              Visão Mensal
            </Link>
            <Link
              to="/semana"
              onClick={closeMenu}
              className={`block px-3 py-3 rounded-md text-base font-medium ${location.pathname === '/semana' ? 'bg-gold/10 text-gold' : 'text-dark dark:text-cream hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              Próximos 7 Dias
            </Link>

            <div className="pt-4 mt-4 border-t border-black/10 dark:border-white/10">
              {user ? (
                <div className="space-y-3">
                  <p className="px-3 text-sm text-dark/70 dark:text-cream/70">{user.email}</p>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-3 text-red-600 dark:text-red-400 font-medium rounded-md hover:bg-red-500/10"
                  >
                    <LogOut size={20} /> Encerrar Sessão
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onLoginClick();
                    closeMenu();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-3 text-gold font-medium rounded-md hover:bg-gold/10"
                >
                  <LogIn size={20} /> Acesso Restrito
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
