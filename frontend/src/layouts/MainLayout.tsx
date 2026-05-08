import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  MapPin, 
  Box, 
  LogOut, 
  Menu,
  Shield,
  Activity
} from 'lucide-react';
import { clsx } from 'clsx';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'student';

  const getNavItems = () => {
    const common = [
      { to: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
      { to: '/clubs', label: 'Clubs', icon: <Users size={20} /> },
      { to: '/events', label: 'Events', icon: <Calendar size={20} /> },
      { to: '/posts', label: 'News Feed', icon: <MessageSquare size={20} /> },
      { to: '/rooms', label: 'Rooms', icon: <MapPin size={20} /> },
      { to: '/facilities', label: 'Facilities', icon: <Box size={20} /> },
    ];

    if (role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Admin Panel', icon: <Shield size={20} /> },
        { to: '/admin/users', label: 'Manage Users', icon: <Users size={20} /> },
        { to: '/admin/approvals', label: 'Approvals', icon: <Activity size={20} /> },
        ...common
      ];
    }

    if (role === 'club_manager') {
      return [
        { to: '/manager/dashboard', label: 'Manage Club', icon: <Shield size={20} /> },
        ...common
      ];
    }

    return common;
  };

  return (
    <div className={styles.layout}>
      <aside className={clsx(styles.sidebar, isMobileOpen && styles.open)}>
        <div className={styles.logo}>
          <Box className="text-primary" />
          CampusConnect
        </div>
        <nav className={styles.nav}>
          {getNavItems().map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx(styles.navLink, isActive && styles.active)}
              onClick={() => setIsMobileOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className="d-flex items-center gap-4">
            <button 
              className="d-md-none" 
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Welcome, {user?.first_name}</h2>
          </div>
          <div className={styles.userInfo}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {role.replace('_', ' ').toUpperCase()}
            </span>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
