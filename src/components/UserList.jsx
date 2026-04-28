function UserList({ users }) {
    if (!users || users.length === 0) {
        return (
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 mt-6 text-center">
                <p className="text-gray-400">No hay usuarios registrados aún.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 mt-6 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-900 border-b border-gray-700 text-gray-400 text-sm">
                            <th className="py-4 px-6 font-semibold">ID</th>
                            <th className="py-4 px-6 font-semibold">Nombre</th>
                            <th className="py-4 px-6 font-semibold">Correo Electrónico</th>
                            <th className="py-4 px-6 font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                                <td className="py-4 px-6 text-gray-500">#{user.id}</td>
                                <td className="py-4 px-6 font-medium text-white">{user.name}</td>
                                <td className="py-4 px-6 text-gray-400">{user.email}</td>
                                <td className="py-4 px-6">
                                    <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mr-3 transition-colors">Editar</button>
                                    <button className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserList;
