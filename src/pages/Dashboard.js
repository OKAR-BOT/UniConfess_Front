import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import { GetUsers, CreateUser } from '../service/api';

function Dashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await GetUsers();
                setUsers(data);
            } catch (error) {
                console.error("Error al cargar los usuarios ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleAddUser = async (user) => {
        try {
            const newUser = await CreateUser(user);
            // La API de JSONPlaceholder simula la creación pero puede devolver IDs duplicados si creamos varios,
            // asignamos un ID aleatorio localmente para evitar errores de la key en React:
            const userWithId = { ...newUser, id: newUser.id === 11 ? Date.now() : newUser.id };
            setUsers([userWithId, ...users]);
        } catch (error) {
            console.error("Error al crear usuario ", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-10 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl">
                    <h1 className="text-3xl font-bold mb-4">Panel de Control</h1>
                    <p className="text-gray-400 italic">"Hola mundo", has entrado exitosamente.</p>
                    
                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Estado</p>
                            <p className="text-green-400 font-mono mt-1">Conectado</p>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700/50">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Rol</p>
                            <p className="text-indigo-400 font-mono mt-1">Administrador</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-2">Gestión de Usuarios</h2>
                    <p className="text-gray-400 mb-6 text-sm">Administra los accesos y registros de la plataforma.</p>
                    
                    <UserForm onAddUser={handleAddUser} />

                    {loading ? (
                        <div className="flex justify-center items-center py-12 mt-6 bg-gray-900 rounded-xl border border-gray-800">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            <span className="ml-3 text-gray-400">Cargando usuarios...</span>
                        </div>
                    ) : (
                        <UserList users={users} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;