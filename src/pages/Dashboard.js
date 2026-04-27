import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {



    return (
        <div className="min-h-screen bg-gray-950 text-white p-10">
            <div className="max-w-4xl mx-auto bg-gray-900 p-8 rounded-2xl border border-gray-800">
                <h1 className="text-3xl font-bold mb-4"> Panel de Control</h1>
                <p className="text-gray-400 italic">"Hola mundo", has entrado exitosamente.</p>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Estado</p>
                        <p className="text-green-400 font-mono">Conectado</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Rol</p>
                        <p className="text-indigo-400 font-mono">Administrador</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;