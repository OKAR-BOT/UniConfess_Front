import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Membership() {
  const [selected, setSelected] = useState('anual');

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white">Membresía UConfess</h1>
          <p className="mt-2 text-gray-400">
            Apoya el proyecto y desbloquea beneficios para la comunidad UTP.
          </p>
          <Link to="/feed" className="mt-4 inline-block text-sm text-indigo-400 hover:underline">
            ← Ir al feed
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div
            onClick={() => setSelected('mensual')}
            onKeyDown={(e) => e.key === 'Enter' && setSelected('mensual')}
            role="button"
            tabIndex={0}
            className={`flex cursor-pointer flex-col rounded-2xl border-2 p-8 transition-all duration-300 ${
              selected === 'mensual'
                ? 'scale-[1.02] border-indigo-600 shadow-xl'
                : 'border-gray-700 opacity-70 hover:opacity-100'
            }`}
          >
            <h3 className="text-xl font-semibold text-white">Plan Mensual</h3>
            <p className="mt-4 text-4xl font-bold text-white">
              S/9.99<span className="text-base font-normal">/mes</span>
            </p>
            <ul className="mt-6 flex-grow space-y-4 text-gray-300">
              <li>✅ Acceso total al contenido</li>
              <li>✅ Navegación sin anuncios</li>
              <li>✅ Soporte prioritario</li>
              <li>✅ Cancela cuando quieras</li>
            </ul>
            <a
              href="https://www.paypal.com/donate?hosted_button_id=5Z6K7X9Y8A1B2"
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-8 block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
                selected === 'mensual' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-white'
              }`}
            >
              Elegir mensual
            </a>
          </div>

          <div
            onClick={() => setSelected('anual')}
            onKeyDown={(e) => e.key === 'Enter' && setSelected('anual')}
            role="button"
            tabIndex={0}
            className={`relative flex cursor-pointer flex-col rounded-2xl border-2 p-8 transition-all duration-300 ${
              selected === 'anual'
                ? 'scale-[1.02] border-indigo-600 shadow-xl'
                : 'border-gray-700 opacity-70 hover:opacity-100'
            }`}
          >
            <span className="absolute -top-3 left-4 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Más popular
            </span>
            <h3 className="text-xl font-semibold text-white">Plan Anual</h3>
            <p className="mt-4 text-4xl font-bold text-white">
              S/89.99<span className="text-base font-normal">/año</span>
            </p>
            <p className="mt-1 text-sm font-medium text-indigo-400">¡Ahorras un 25%!</p>
            <ul className="mt-6 flex-grow space-y-4 text-gray-300">
              <li>✅ Todo lo del plan mensual</li>
              <li>✅ Ahorro frente al pago mensual</li>
              <li>✅ Acceso anticipado a funciones beta</li>
              <li>✅ Insignia en tus publicaciones</li>
            </ul>
            <a
              href="https://www.paypal.com/donate?hosted_button_id=5Z6K7X9Y8A1B2"
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-8 block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
                selected === 'anual' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-white'
              }`}
            >
              Elegir anual
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
