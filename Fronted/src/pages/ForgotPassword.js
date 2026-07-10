import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../service/api';
import MeshBackground from '../components/MeshBackground';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';

const OTP_KEY = 'uconfess_reset_otp_pending_v1';

function readPending() {
  try {
    const raw = sessionStorage.getItem(OTP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePending(value) {
  try {
    if (!value) { sessionStorage.removeItem(OTP_KEY); return; }
    sessionStorage.setItem(OTP_KEY, JSON.stringify(value));
  } catch {}
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { connected, joinEmailRoom, notifications } = useRealtime();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pending, setPending] = useState(() => readPending());
  const [step, setStep] = useState(() => (readPending() ? 'otp' : 'email'));
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const otpNotification = notifications.find(
    (item) => item.type === 'otp' && item.challengeId === pending?.challengeId && item.code
  );

  useEffect(() => { writePending(pending); }, [pending]);

  useEffect(() => {
    if (pending?.email && connected) {
      joinEmailRoom(pending.email);
    }
  }, [pending, connected, joinEmailRoom]);

  useEffect(() => {
    if (!pending?.challengeId) return;
    if (otpNotification?.code) {
      setOtp(String(otpNotification.code));
    }
  }, [notifications, pending, otpNotification]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Ingresa tu correo.'); return; }
    setError(null);
    setSending(true);
    try {
      await joinEmailRoom(email);
      const result = await apiRequest('POST', 'auth/forgot-password', { email });
      if (result?.requiresOtp && result.challengeId) {
        setPending({
          challengeId: result.challengeId,
          expiresAt: result.expiresAt || null,
          email: email.trim(),
        });
        setStep('otp');
        setDevCode(process.env.NODE_ENV !== 'production' && result.devCode ? String(result.devCode) : '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar codigo.');
    } finally {
      setSending(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { setError('Ingresa el codigo OTP.'); return; }
    if (newPassword.length < 6) { setError('La contrasena debe tener al menos 6 caracteres.'); return; }
    if (!pending?.challengeId) { setError('La sesion expiro. Vuelve a solicitar.'); return; }
    setError(null);
    setResetting(true);
    try {
      const result = await apiRequest('POST', 'auth/reset-password', {
        challengeId: pending.challengeId, code: otp, newPassword,
      });
      if (result.token && result.user) {
        setSuccessMsg('Contrasena actualizada exitosamente.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restablecer.');
    } finally {
      setResetting(false);
    }
  };

  const cancelOtp = () => {
    setPending(null);
    setStep('email');
    setOtp('');
    setError(null);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4.25rem)] items-center justify-center px-4 py-12">
      <MeshBackground variant="auth" />
      <form
        onSubmit={step === 'otp' ? handleReset : handleSendCode}
        className="card-utp relative z-10 w-full max-w-md p-8 shadow-xl"
      >
        <div className="mb-6 flex justify-center">
          <span className="flex leading-none">
            <span className="logo-block--red text-base">U</span>
            <span className="logo-block--dark -ml-0.5 text-base">C</span>
          </span>
        </div>

        {successMsg ? (
          <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-center text-sm font-medium text-green-600">
            {successMsg}
          </div>
        ) : null}

        {step === 'email' ? (
          <>
            <h1 className="text-center text-2xl font-black text-theme">
              Recuperar contrasena
            </h1>
            <p className="mt-2 text-center text-sm text-theme-secondary">
              Ingresa tu correo para recibir un codigo de verificacion.
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
            </div>
            {error ? <p className="alert-error mt-4">{error}</p> : null}
            <button
              type="submit"
              disabled={sending}
              className="btn-utp-primary mt-6 w-full py-3.5"
            >
              {sending ? 'Enviando...' : 'Enviar codigo'}
            </button>
            <p className="mt-6 text-center text-sm text-theme-muted">
              <Link to="/login" className="font-bold text-utp-red hover:underline">
                Volver a inicio de sesion
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-center text-2xl font-black text-theme">
              Nueva contrasena
            </h1>
            <p className="mt-2 text-center text-sm text-theme-secondary">
              Ingresa el codigo recibido en <span className="font-semibold">{email}</span>
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
              <input
                type="password"
                required
                minLength={6}
                placeholder="Nueva contrasena (min. 6 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-utp p-3"
              />
            </div>
            {error ? <p className="alert-error mt-4">{error}</p> : null}
            {devCode && !otpNotification?.code ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                Codigo disponible: <span className="font-mono font-semibold">{devCode}</span>
              </div>
            ) : null}
            <button
              type="submit"
              disabled={resetting}
              className="btn-utp-primary mt-6 w-full py-3.5"
            >
              {resetting ? 'Restableciendo...' : 'Restablecer contrasena'}
            </button>
            <div className="mt-3 flex justify-center">
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
