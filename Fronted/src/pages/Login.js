import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MeshBackground from '../components/MeshBackground';
import { useRealtime } from '../context/RealtimeContext';


const OTP_KEY = 'uconfess_login_otp_pending_v1';
const LOGIN_SUCCESS_KEY = 'uconfess_login_success_v1';

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
    // Ignored on purpose.
  }
}

function routeByRole(user) {
  return user?.role === 'admin' ? '/admin' : '/feed';
}

function markLoginSuccess() {
  try {
    sessionStorage.setItem(LOGIN_SUCCESS_KEY, '1');
  } catch {
    // Ignored on purpose.
  }
}

function Login() {
  const { login, verifyOtp } = useAuth();
  const { connected, joinEmailRoom, notifications } = useRealtime();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingOtp, setPendingOtp] = useState(() => readPendingOtp());
  const [step, setStep] = useState(() => (readPendingOtp() ? 'otp' : 'credentials'));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devCode, setDevCode] = useState('');
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

  const requestOtp = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (!email.trim() || !password) {
      setError('Completa tu correo y contrasena.');
      return;
    }

    setError(null);
    setDevCode('');
    setLoading(true);
    try {
      await joinEmailRoom(email);
      const result = await login(email, password);

      if (result?.token && result?.user) {
        setPendingOtp(null);
        setStep('credentials');
        setOtp('');
        setDevCode('');
        markLoginSuccess();
        navigate(routeByRole(result.user), { replace: true });
        return;
      }

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
          setToastMessage(`Codigo enviado a ${email.trim()}`);
          setShowSentToast(true);
        }
        return;
      }

      throw new Error('Respuesta inesperada del servidor.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || !password || resending || cooldown > 0) {
      return;
    }

    setError(null);
    setResending(true);
    try {
      await joinEmailRoom(email);
      const result = await login(email, password);

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
          setToastMessage(`Codigo reenviado a ${email.trim()}`);
          setShowSentToast(true);
        }
        return;
      }

      throw new Error('Respuesta inesperada del servidor.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reenviar el codigo.');
    } finally {
      setResending(false);
    }
  };

  const verifyCode = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (!pendingOtp?.challengeId) {
      setError('La sesion del codigo ya no existe. Vuelve a iniciar sesion.');
      return;
    }

    if (!otp.trim()) {
      setError('Ingresa el codigo OTP.');
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
      markLoginSuccess();
      navigate(routeByRole(user), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo verificar el codigo.');
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
        onSubmit={step === 'otp' ? verifyCode : requestOtp}
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
            <h1 className="text-center text-2xl font-black text-theme">
              Entrar a UConfess
            </h1>
            <p className="mt-2 text-center text-sm text-theme-secondary">
              Tu acceso al feed requiere correo y codigo OTP.
            </p>

            <div className="mt-8 space-y-4">
              <input
                type="email"
                required
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-utp p-3"
              />
              <input
                type="password"
                required
                placeholder="Contrasena"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-utp p-3"
              />
            </div>

            {error ? <p className="alert-error mt-4">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-utp-primary mt-6 w-full py-3.5"
            >
              {loading ? 'Enviando codigo...' : 'Continuar'}
            </button>

            <p className="mt-6 text-center text-sm text-theme-muted">
              No tienes cuenta?{' '}
              <Link to="/register" className="font-bold text-utp-red hover:underline">
                Registrate
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-center text-2xl font-black text-theme">
              Verificar codigo
            </h1>
            <p className="mt-2 text-center text-sm text-theme-secondary">
              Te enviamos un codigo de verificacion a<br />
              <span className="font-semibold">{email}</span>
            </p>

            <div className="mt-8 space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                maxLength={8}
                placeholder="Codigo OTP"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                className="input-utp p-3 w-full text-center text-2xl tracking-[0.35em]"
                autoFocus
              />
              {pendingOtp?.expiresAt ? (
                <p className="text-center text-xs text-theme-muted">
                  Codigo activo hasta {new Date(pendingOtp.expiresAt).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              ) : null}
            </div>

            {error ? <p className="alert-error mt-4">{error}</p> : null}

            {devCode && !otpNotification?.code ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                Codigo disponible: <span className="font-mono font-semibold">{devCode}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={verifying}
              className="btn-utp-primary mt-6 w-full py-3.5"
            >
              {verifying ? 'Verificando...' : 'Verificar codigo'}
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
                    : 'Reenviar codigo'}
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

export default Login;
