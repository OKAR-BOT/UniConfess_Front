import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MeshBackground from '../components/MeshBackground';
import { useRealtime } from '../context/RealtimeContext';

const OTP_KEY = 'uconfess_login_otp_pending_v1';

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
        navigate(routeByRole(result.user), { replace: true });
        return;
      }

      if (result?.requiresOtp && result.challengeId) {
        setPendingOtp({
          challengeId: result.challengeId,
          expiresAt: result.expiresAt || null,
          email: email.trim(),
        });
        setOtp('');
        setStep('otp');
        setDevCode(process.env.NODE_ENV !== 'production' && result.devCode ? String(result.devCode) : '');
        return;
      }

      throw new Error('Respuesta inesperada del servidor.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion.');
    } finally {
      setLoading(false);
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

        <h1 className="text-center text-2xl font-black text-theme">
          {step === 'otp' ? 'Verificar codigo' : 'Entrar a UConfess'}
        </h1>
        <p className="mt-2 text-center text-sm text-theme-secondary">
          {step === 'otp'
            ? 'Ingresa el codigo que te llego por correo o notificacion web.'
            : 'Tu acceso al feed requiere correo y codigo OTP.'}
        </p>

        <div className="mt-8 space-y-4">
          {step === 'credentials' ? (
            <>
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
            </>
          ) : (
            <>
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
                className="input-utp p-3 text-center tracking-[0.35em]"
              />
              {pendingOtp?.expiresAt ? (
                <p className="text-center text-xs text-theme-muted">
                  Codigo activo hasta {new Date(pendingOtp.expiresAt).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              ) : null}
            </>
          )}
        </div>

        {error ? <p className="alert-error mt-4">{error}</p> : null}

        {devCode && step === 'otp' && !otpNotification?.code ? (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            Codigo disponible: <span className="font-mono font-semibold">{devCode}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || verifying}
          className="btn-utp-primary mt-6 w-full py-3.5"
        >
          {step === 'otp'
            ? verifying
              ? 'Verificando...'
              : 'Verificar codigo'
            : loading
              ? 'Enviando codigo...'
              : 'Continuar'}
        </button>

        {step === 'otp' ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={requestOtp}
              disabled={loading || verifying || !password}
              className="text-sm font-semibold text-utp-red hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reenviar codigo
            </button>

            <button
              type="button"
              onClick={cancelOtp}
              className="text-sm font-semibold text-theme-muted hover:text-utp-red"
            >
              Volver
            </button>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-theme-muted">
            No tienes cuenta?{' '}
            <Link to="/register" className="font-bold text-utp-red hover:underline">
              Registrate
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}

export default Login;
