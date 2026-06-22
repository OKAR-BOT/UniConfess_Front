import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationTray from './components/NotificationTray';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { RealtimeProvider, useRealtime } from './context/RealtimeContext';
import Home from './pages/Home';
import Feed from './pages/Feed';
import About from './pages/About';
import Membership from './pages/Membership';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminConfessions from './pages/admin/AdminConfessions';
import { useAuth } from './context/AuthContext';
import { useEffect, useRef } from 'react';

function RealtimeSessionBridge() {
  const { user } = useAuth();
  const { connected, joinUserRoom, leaveUserRoom } = useRealtime();
  const joinedUserId = useRef(null);

  useEffect(() => {
    const currentUserId = user?.id || null;
    if (joinedUserId.current && joinedUserId.current !== currentUserId && connected) {
      leaveUserRoom(joinedUserId.current);
      joinedUserId.current = null;
    }

    if (!connected) {
      return;
    }

    if (currentUserId && joinedUserId.current !== currentUserId) {
      joinUserRoom(currentUserId);
      joinedUserId.current = currentUserId;
      return;
    }

    if (!currentUserId) {
      joinedUserId.current = null;
    }
  }, [user, connected, joinUserRoom, leaveUserRoom]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const isFeed = location.pathname === '/feed';
  const isAdmin = location.pathname.startsWith('/admin');
  const showFooter = !isFeed && !isAdmin;

  return (
    <div className="app-shell">
      <Navbar />
      <NotificationTray />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/about" element={<About />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:handle" element={<Profile />} />

        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="confessions" element={<AdminConfessions />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {showFooter ? <Footer /> : null}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <RealtimeProvider>
          <AuthProvider>
            <RealtimeSessionBridge />
            <AppRoutes />
          </AuthProvider>
        </RealtimeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
