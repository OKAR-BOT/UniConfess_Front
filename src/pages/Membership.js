import { useState } from 'react';

export default function PricingCards() {
  const [selected, setSelected] = useState('anual', 'mensual');

  return (
    <div className="bg-gray-900 min-h-screen">
    <div className="max-w-4xl mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Tarjeta Mensual */}
      <div 
        onClick={() => setSelected('mensual')}
        className= {`transition-all duration-300 border-2 rounded-2xl p-8 flex flex-col cursor-pointer
          ${selected === 'mensual' 
            ? 'border-indigo-600 shadow-xl scale-105' 
            : 'border-gray-200 opacity-60 hover:opacity-100'}`}
      >
        <h3 className="text-xl font-semibold text-white">Plan Mensual</h3>
        <p className="mt-4 text-4xl font-bold text-white">S/9.99<span className="text-base font-normal text-white">/mes</span></p>
        
        <ul className="mt-6 space-y-4 text-white flex-grow">
          <li>✅ Acceso total a contenido</li>
          <li>✅ Navegación sin anuncios</li>
          <li>✅ Soporte prioritario</li>
          <li>✅ Flexibilidad total (cancela cuando quieras)</li>
        </ul>

        <a href="https://www.paypal.com/donate?hosted_button_id=5Z6K7X9Y8A1B2" target="_blank" rel="noopener noreferrer" className={`mt-8 block w-full py-3 rounded-lg font-semibold transition-colors text-center
        ${selected === 'mensual' ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-white'}`}>
        Elegir Anual
        </a>
      </div>

      {/* Tarjeta Anual */}
      <div 
        onClick={() => setSelected('anual')}
        className={`transition-all duration-300 border-2 rounded-2xl p-8 flex flex-col relative cursor-pointer
          ${selected === 'anual' 
            ? 'border-indigo-600 shadow-xl scale-105' 
            : 'border-gray-200 opacity-60 hover:opacity-100'}`}
      >
        <span className="absolute -top-3 left-4 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Más Popular</span>
        <h3 className="text-xl font-semibold text-white">Plan Anual</h3>
        <p className="mt-4 text-4xl font-bold text-white">S/89.99<span className="text-base font-normal text-white">/año</span></p>
        <p className="text-indigo-600 text-sm font-medium mt-1">¡Ahorras un 25%!</p>
        
        <ul className="mt-6 space-y-4 text-white flex-grow">
          <li>✅ Todo lo del plan mensual</li>
          <li>✅ <b>Ahorro de S/30 USD anuales</b></li>
          <li>✅ Acceso anticipado a funciones Beta</li>
          <li>✅ Insignia exclusiva en tus confesiones</li>
        </ul>

        <a href="https://www.paypal.com/donate?hosted_button_id=5Z6K7X9Y8A1B2" target="_blank" rel="noopener noreferrer" className={`mt-8 block w-full py-3 rounded-lg font-semibold transition-colors text-center
        ${selected === 'anual' ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-white'}`}>
        Elegir Anual
        </a>
      </div>

    </div>
    </div>
  );
}