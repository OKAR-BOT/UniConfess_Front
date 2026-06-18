import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Membership() {
  const [selected, setSelected] = useState('anual');

  return (
    <div className="page-shell min-h-[calc(100vh-4.25rem)]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 text-center">
          <p className="badge-live mx-auto w-fit">Premium</p>
          <h1 className="mt-4 text-3xl font-black text-theme sm:text-4xl">
            Membresía <span className="text-gradient-utp">UConfess</span>
          </h1>
          <p className="mt-2 text-theme-secondary">
            Apoya el proyecto y desbloquea beneficios para la comunidad UTP.
          </p>
          <Link to="/feed" className="mt-4 inline-block text-sm font-bold text-utp-red hover:underline">
            ← Ir al feed
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[
            {
              id: 'mensual',
              title: 'Plan Mensual',
              price: 'S/9.99',
              period: '/mes',
              perks: [
                'Acceso total al contenido',
                'Navegación sin anuncios',
                'Soporte prioritario',
                'Cancela cuando quieras',
              ],
              cta: 'Elegir mensual',
            },
            {
              id: 'anual',
              title: 'Plan Anual',
              price: 'S/89.99',
              period: '/año',
              badge: 'Más popular',
              save: '¡Ahorras un 25%!',
              perks: [
                'Todo lo del plan mensual',
                'Ahorro frente al pago mensual',
                'Acceso anticipado a funciones beta',
                'Insignia en tus publicaciones',
              ],
              cta: 'Elegir anual',
            },
          ].map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(plan.id)}
              role="button"
              tabIndex={0}
              className={`card-utp-interactive relative flex cursor-pointer flex-col p-8 ${
                selected === plan.id ? 'ring-2 ring-utp-red' : 'opacity-90'
              }`}
            >
              {plan.badge ? (
                <span className="absolute -top-3 left-4 rounded-full bg-utp-red px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  {plan.badge}
                </span>
              ) : null}
              <h3 className="text-xl font-black text-theme">{plan.title}</h3>
              <p className="mt-4 text-4xl font-black text-utp-red">
                {plan.price}
                <span className="text-base font-normal text-theme-muted">{plan.period}</span>
              </p>
              {plan.save ? (
                <p className="mt-1 text-sm font-bold text-utp-green">{plan.save}</p>
              ) : null}
              <ul className="mt-6 flex-grow space-y-3 text-sm text-theme-secondary">
                {plan.perks.map((perk) => (
                  <li key={perk}>✅ {perk}</li>
                ))}
              </ul>
              <a
                href="https://www.paypal.com/donate?hosted_button_id=5Z6K7X9Y8A1B2"
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 block w-full rounded-2xl py-3 text-center font-bold transition-all ${
                  selected === plan.id
                    ? 'btn-utp-primary'
                    : 'btn-utp-secondary'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
