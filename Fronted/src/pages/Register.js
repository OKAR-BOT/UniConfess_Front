import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CareerSearchSelect from '../components/CareerSearchSelect';
import MeshBackground from '../components/MeshBackground';
import axios from 'axios';

export default function Register() {
    const [nombre, setNombre] = useState('');
    const [usuario, setUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [career, setCareer] = useState('');
    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);

    const manejoEnvio = async (e) => {
      e.preventDefault();

      // creamos al objeto del usuario
      const nuevoUsuario = {
        nameuser: nombre,
        user: usuario,
        email: email,
        password: password,
        career: career,
      };

      try {
        setLoading(true);
        const respuesta = await axios.post('http://localhost:8080/api/users', nuevoUsuario);

        // Limpiamos el formulario
      setNombre('');
      setEmail('');
      setPassword('');
      setCareer('');
      } catch (error) {
        setError('Error al crear la cuenta. Inténtalo de nuevo.', error);
      }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4.25rem)] items-center justify-center px-4 py-12">
      <MeshBackground variant="auth" />
      <form onSubmit={manejoEnvio} className="card-utp relative z-10 w-full max-w-md p-8 shadow-xl">
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
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-utp mt-1"
              placeholder="Ej. María Pérez"
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
              value={usuario}
              onChange={(e) => setUsuario(e.target.value.replace(/\s/g, ''))}
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

        <button type="submit" className="btn-utp-primary mt-6 w-full py-3.5">
          {'Crear mi cuenta →'}
        </button>

        <p className="mt-6 text-center text-sm text-theme-muted">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold text-utp-red hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
