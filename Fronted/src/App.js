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
import { useEffect, useRef, useState } from 'react';

const LOGIN_SUCCESS_KEY = 'uconfess_login_success_v1';
const REGISTER_SUCCESS_KEY = 'uconfess_register_success_v1';

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
  const [flashMessage, setFlashMessage] = useState(null);
  const isFeed = location.pathname === '/feed';
  const isAdmin = location.pathname.startsWith('/admin');
  const showFooter = !isFeed && !isAdmin;

  useEffect(() => {
    let nextMessage = null;

    try {
      const shouldShowLoginSuccess = sessionStorage.getItem(LOGIN_SUCCESS_KEY) === '1';
      const shouldShowRegisterSuccess = sessionStorage.getItem(REGISTER_SUCCESS_KEY) === '1';

      if (shouldShowLoginSuccess) {
        sessionStorage.removeItem(LOGIN_SUCCESS_KEY);
        nextMessage = {
          title: 'Sesion exitosa',
          message: 'Bienvenido a UConfess.',
        };
      }

      if (shouldShowRegisterSuccess) {
        sessionStorage.removeItem(REGISTER_SUCCESS_KEY);
        nextMessage = {
          title: 'Registrado correctamente',
          message: 'Tu cuenta fue creada con exito.',
        };
      }
    } catch {
      // sessionStorage may be unavailable in restricted browser contexts.
    }

    if (!nextMessage) return undefined;

    setFlashMessage(nextMessage);
    const timer = window.setTimeout(() => setFlashMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Navbar />
      <NotificationTray />

      {flashMessage ? (
        <div className="mx-auto mt-4 w-full max-w-5xl px-4">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-700 shadow-sm dark:text-green-300">
            <div>
              <p className="text-sm font-black">{flashMessage.title}</p>
              <p className="mt-0.5 text-sm">{flashMessage.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setFlashMessage(null)}
              className="shrink-0 rounded-md px-2 text-lg leading-6 text-green-700 transition hover:bg-green-500/10 dark:text-green-300"
              aria-label="Cerrar mensaje"
            >
              &times;
            </button>
          </div>
        </div>
      ) : null}

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
