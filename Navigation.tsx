import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { 
  Users2, 
  GraduationCap, 
  Coffee, 
  Archive, 
  Globe, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  UserPlus,
  Menu,
  X,
  MessagesSquare
} from 'lucide-react';

export function Navigation() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    closeMenu();
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <span className="text-3xl font-sans tracking-wider">
              <span className="font-normal">LINK</span>
              <span className="text-[#8e59cb] font-extrabold">ED</span>
              <span className="font-normal">&nbsp;LEADERS</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/search"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
            >
              <Users2 className="h-5 w-5 mr-1" />
              Mentorship
            </Link>
            
            <Link
              to="/masterclasses"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
            >
              <GraduationCap className="h-5 w-5 mr-1" />
              Masterclasses
            </Link>

            <Link
              to="/commons"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
            >
              <MessagesSquare className="h-5 w-5 mr-1" />
              Commons
            </Link>

            <Link
              to="/vault"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
            >
              <Archive className="h-5 w-5 mr-1" />
              Vault
            </Link>

            <Link
              to="/directory"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
            >
              <Globe className="h-5 w-5 mr-1" />
              Directory
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/messages"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <LayoutDashboard className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <LogIn className="h-5 w-5 mr-1" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                >
                  <UserPlus className="h-5 w-5 mr-1" />
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden fixed left-0 right-0 bg-white border-t border-gray-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/search"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center"
                onClick={closeMenu}
              >
                <Users2 className="h-5 w-5 mr-2" />
                Mentorship
              </Link>
              
              <Link
                to="/masterclasses"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center"
                onClick={closeMenu}
              >
                <GraduationCap className="h-5 w-5 mr-2" />
                Masterclasses
              </Link>

              <Link
                to="/commons"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center"
                onClick={closeMenu}
              >
                <MessagesSquare className="h-5 w-5 mr-2" />
                Commons
              </Link>

              <Link
                to="/vault"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center"
                onClick={closeMenu}
              >
                <Archive className="h-5 w-5 mr-2" />
                Vault
              </Link>

              <Link
                to="/directory"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center"
                onClick={closeMenu}
              >
                <Globe className="h-5 w-5 mr-2" />
                Directory
              </Link>

              {user ? (
                <>
                  <Link
                    to="/messages"
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center"
                    onClick={closeMenu}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Messages
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center"
                    onClick={closeMenu}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md flex items-center"
                    onClick={closeMenu}
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                    onClick={closeMenu}
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}