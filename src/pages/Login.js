import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = (e) => {
    e.preventDefault();

    
    if (email === 'admin@test.com' && password === '1234') {
      localStorage.setItem('isAuthenticated', 'true');
      
      
      navigate('/dashboard'); 
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-96">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login Dark</h2>
        
        <input 
          type="email" 
          placeholder="admin@test.com"
          className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded text-white outline-none focus:border-indigo-500"
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input 
          type="password" 
          placeholder="1234"
          className="w-full p-3 mb-6 bg-gray-800 border border-gray-700 rounded text-white outline-none focus:border-indigo-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded transition">
          Entrar al Dashboard
        </button>
      </form>
    </div>
  );
};

export default Login;