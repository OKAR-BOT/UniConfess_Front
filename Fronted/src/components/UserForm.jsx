import { useState } from 'react';

function UserForm({ onAddUser }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        
        onAddUser({ name, email });
        setName('');
        setEmail('');
    };

    return (
        <form onSubmit={handleSubmit} className="card-utp mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Añadir Nuevo Usuario</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="input-utp"
                    />
                </div>
                
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Correo Electrónico</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        className="input-utp"
                    />
                </div>
            </div>
            
            <div className="mt-6 flex justify-end">
                <button type="submit" className="btn-utp-primary">
                    Guardar Usuario
                </button>
            </div>
        </form>
    );
}

export default UserForm;
