import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext'; // Asegúrate de que esta sea la ruta correcta
import CareerSearchSelect from '../components/CareerSearchSelect';
import MeshBackground from '../components/MeshBackground';

const REGISTER_SUCCESS_KEY = 'uconfess_register_success_v1';
const OTP_KEY = 'uconfess_register_otp_pending_v2'; // Clave única para el registro

function markRegisterSuccess() {
  try {
    sessionStorage.setItem(REGISTER_SUCCESS_KEY, '1');
  } catch {
    
  }
}

function readPendingOtp() {
  try {
    const raw = sessionStorage.getItem(OTP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePendingOtp(value) {
  try {
    if (!value) {
      sessionStorage.removeItem(OTP_KEY);
      return;
    }
    sessionStorage.setItem(OTP_KEY, JSON.stringify(value));
  } catch {

  }
}

function routeByRole(user) {
  return user?.role === 'admin' ? '/admin' : '/feed';
}

export default function Register() {
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { connected, joinEmailRoom, notifications } = useRealtime();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [career, setCareer] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingOtp, setPendingOtp] = useState(() => readPendingOtp());
  const [step, setStep] = useState(() => (readPendingOtp() ? 'otp' : 'credentials'));
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showSentToast, setShowSentToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const otpNotification = notifications.find(
    (item) => item.type === 'otp' && item.challengeId === pendingOtp?.challengeId && item.code
  );

  useEffect(() => {
    writePendingOtp(pendingOtp);
  }, [pendingOtp]);

  useEffect(() => {
    if (pendingOtp) {
      setStep('otp');
    }
  }, [pendingOtp]);

  useEffect(() => {
    if (pendingOtp?.email && connected) {
      joinEmailRoom(pendingOtp.email);
    }
  }, [pendingOtp, connected, joinEmailRoom]);

  useEffect(() => {
    if (!pendingOtp?.challengeId) return;
    if (otpNotification?.code) {
      setOtp(String(otpNotification.code));
    }
  }, [notifications, pendingOtp, otpNotification]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!showSentToast) return;
    const timer = setTimeout(() => setShowSentToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showSentToast]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!career) {
      setError('Selecciona tu carrera de la lista UTP.');
      return;
    }
    setError(null);
    setDevCode('');
    setLoading(true);

    try {
      await joinEmailRoom(email.trim());
      const result = await register({ displayName, handle, email, password, career });

      if (result?.requiresOtp && result.challengeId) {
        setPendingOtp({
          challengeId: result.challengeId,
          expiresAt: result.expiresAt || null,
          email: email.trim(),
          deliveryMethod: result.deliveryMethod || 'websocket',
        });
        setOtp('');
        setStep('otp');
        setDevCode(process.env.NODE_ENV !== 'production' && result.devCode ? String(result.devCode) : '');
        
        if (result.deliveryMethod === 'email') {
          setToastMessage(`Código enviado a ${email.trim()}`);
          setShowSentToast(true);
        }
        return;
      }

      throw new Error('Respuesta inesperada del servidor.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar.');
    } finally {
      setLoading(false);
    }
  }
  const handleResend = async () => {
    if (!email.trim() || !password || resending || cooldown > 0) {
      return;
    }

    setError(null);
    setResending(true);
    try {
      await joinEmailRoom(email.trim());
      const result = await register({ displayName, handle, email, password, career });

      if (result?.requiresOtp && result.challengeId) {
        setPendingOtp({
          challengeId: result.challengeId,
          expiresAt: result.expiresAt || null,
          email: email.trim(),
          deliveryMethod: result.deliveryMethod || 'websocket',
        });
        setOtp('');
        setDevCode(process.env.NODE_ENV !== 'production' && result.devCode ? String(result.devCode) : '');
        setCooldown(30);
        
        if (result.deliveryMethod === 'email') {
          setToastMessage(`Código reenviado a ${email.trim()}`);
          setShowSentToast(true);
        }
        return;
      }

      throw new Error('Respuesta inesperada del servidor.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reenviar el código.');
    } finally {
      setResending(false);
    }
  };
  const verifyCode = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (!pendingOtp?.challengeId) {
      setError('La sesión del código ya no existe. Intenta registrarte de nuevo.');
      return;
    }

    if (!otp.trim()) {
      setError('Ingresa el código OTP.');
      return;
    }

    setError(null);
    setVerifying(true);
    try {
      const user = await verifyOtp({ challengeId: pendingOtp.challengeId, code: otp });
      setPendingOtp(null);
      setStep('credentials');
      setOtp('');
      setPassword('');
      setDevCode('');
      markRegisterSuccess();
      navigate(routeByRole(user), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo verificar el código.');
    } finally {
      setVerifying(false);
    }
  };

  const cancelOtp = () => {
    setPendingOtp(null);
    setStep('credentials');
    setOtp('');
    setPassword('');
    setDevCode('');
    setError(null);
    setResending(false);
    setCooldown(0);
    setShowSentToast(false);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4.25rem)] items-center justify-center px-4 py-12">
      <MeshBackground variant="auth" />
      
      <form 
        onSubmit={step === 'otp' ? verifyCode : handleSubmit} 
        className="card-utp relative z-10 w-full max-w-md p-8 shadow-xl"
      >
        <div className="mb-6 flex justify-center">
          <span className="flex leading-none">
            <span className="logo-block--red text-base">U</span>
            <span className="logo-block--dark -ml-0.5 text-base">C</span>
          </span>
        </div>

        {showSentToast ? (
          <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-center text-sm font-medium text-green-600">
            {toastMessage}
          </div>
        ) : null}

        {step === 'credentials' ? (
          <>
            <h1 className="text-2xl font-black text-theme">Únete a la comunidad</h1>
            <p className="mt-1 text-sm text-theme-secondary">
              Tu nombre y usuario serán visibles en tus publicaciones.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-bold text-theme-secondary">
                  Nombre para mostrar
                </label>
                <input
                  id="reg-name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-utp mt-1"
                  placeholder="Ej. Maria Perez"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="reg-handle" className="block text-xs font-bold text-theme-secondary">
                  Usuario (sin @)
                </label>
                <input
                  id="reg-handle"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/\s/g, ''))}
                  className="input-utp mt-1"
                  placeholder="maria_utp"
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-xs font-bold text-theme-secondary">
                  Correo
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-utp mt-1"
                  placeholder="tu@utp.edu.pe"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="reg-pass" className="block text-xs font-bold text-theme-secondary">
                  Contraseña
                </label>
                <input
                  id="reg-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-utp mt-1"
                  autoComplete="new-password"
                />
              </div>
              <CareerSearchSelect id="reg-career" value={career} onChange={setCareer} required />
            </div>

            {error ? <p className="alert-error mt-4">{error}</p> : null}

            <button type="submit" disabled={loading} className="btn-utp-primary mt-6 w-full py-3.5">
              {loading ? 'Enviando código...' : 'Crear mi cuenta →'}
            </button>

            <p className="mt-6 text-center text-sm text-theme-muted">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-bold text-utp-red hover:underline">
                Entrar
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-center text-2xl font-black text-theme">
              Verificar código
            </h1>
            <p className="mt-2 text-center text-sm text-theme-secondary">
              Te enviamos un código de verificación a<br />
              <span className="font-semibold">{email}</span>
            </p>

            <div className="mt-8 space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                maxLength={8}
                placeholder="Código OTP"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                className="input-utp p-3 w-full text-center text-2xl tracking-[0.35em]"
                autoFocus
              />
              {pendingOtp?.expiresAt ? (
                <p className="text-center text-xs text-theme-muted">
                  Código activo hasta {new Date(pendingOtp.expiresAt).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              ) : null}
            </div>

            {error ? <p className="alert-error mt-4">{error}</p> : null}

            {devCode && !otpNotification?.code ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                Código disponible: <span className="font-mono font-semibold">{devCode}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={verifying}
              className="btn-utp-primary mt-6 w-full py-3.5"
            >
              {verifying ? 'Verificando...' : 'Verificar código'}
            </button>

            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="text-sm font-semibold text-utp-red hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resending
                  ? 'Reenviando...'
                  : cooldown > 0
                    ? `Reenviar (${cooldown}s)`
                    : 'Reenviar código'}
              </button>

              <button
                type="button"
                onClick={cancelOtp}
                className="text-sm font-semibold text-theme-muted hover:text-utp-red"
              >
                Volver
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}