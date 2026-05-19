import React, { useEffect, useState } from 'react';
import { Home, Bell, FileText, LayoutDashboard, Settings, ChevronDown, X, LogOut, Award } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/website logo.svg';
import facultyIcon from '../../assets/faculty-icon.svg';
import { api, parseJwt } from '../../lib/api';

const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const [user, setUser] = useState(() => api.auth.getUser());
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const storedUser = api.auth.getUser();
    setUser(storedUser);

    const token = api.auth.getToken();
    const payload = parseJwt(token);
    const userId = storedUser?.user_id || payload?.sub;

    if (!userId) {
      return;
    }

    if (storedUser?.full_name && storedUser?.email) {
      return;
    }

    let isActive = true;
    api.users
      .getById(userId)
      .then((profile) => {
        if (!isActive) return;
        const merged = {
          ...storedUser,
          ...profile,
          user_id: profile.user_id || userId,
        };
        api.auth.setUser(merged);
        setUser(merged);
      })
      .catch((error) => {
        console.warn('Failed to load sidebar user details:', error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;

    const handleOutsideClick = () => {
      setIsProfileDropdownOpen(false);
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isProfileDropdownOpen]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/dean-dashboard' },
    { icon: FileText, label: 'Faculty Nominations', path: '/faculty-nominations' },
    { icon: FileText, label: 'Questions', path: '/questions' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Award, label: 'Acknowledgments', path: '/acknowledgments' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-72 bg-brand-sidebar border-r-2 border-gray-300 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:self-start lg:flex
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  const displayName = user?.full_name || user?.email || 'Account';
  const displayEmail = user?.email || '';
  const avatarSrc = user?.image_base64
    ? `data:image/png;base64,${user.image_base64}`
    : facultyIcon;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Logo Section */}
        <div className="p-8 flex flex-col items-center text-center relative border-b-2 border-gray-200 mb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-brand-grey lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={logo}
            alt="Website Logo"
            className="w-full object-contain mb-2"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-[#E5E7EB] text-brand-black font-semibold'
                  : 'text-brand-grey hover:bg-gray-50 hover:text-brand-black'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-brand-black' : 'text-brand-grey'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t-2 border-gray-200 relative">
          {isProfileDropdownOpen && (
            <div
              className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileDropdownOpen(!isProfileDropdownOpen);
            }}
            className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group ${isProfileDropdownOpen ? 'bg-gray-50' : ''
              }`}
          >
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img src={avatarSrc} alt="User profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-brand-black truncate">{displayName}</p>
              <p className="text-xs text-brand-grey truncate">{displayEmail}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-brand-grey group-hover:text-brand-black transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180 text-brand-black' : ''
              }`} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
