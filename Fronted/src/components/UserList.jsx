function UserList({ users }) {
    if (!users || users.length === 0) {
        return (
            <div className="card-utp mt-6 text-center">
                <p className="text-gray-500">No hay usuarios registrados aún.</p>
            </div>
        );
    }

    return (
        <div className="card-utp mt-6 overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-utp-gray-light text-sm text-gray-600">
                            <th className="py-4 px-6 font-semibold">ID</th>
                            <th className="py-4 px-6 font-semibold">Nombre</th>
                            <th className="py-4 px-6 font-semibold">Correo Electrónico</th>
                            <th className="py-4 px-6 font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-100 transition-colors hover:bg-utp-gray-light/50">
                                <td className="py-4 px-6 text-gray-400">#{user.id}</td>
                                <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                                <td className="py-4 px-6 text-gray-600">{user.email}</td>
                                <td className="py-4 px-6">
                                    <button className="mr-3 text-sm font-medium text-utp-red transition-colors hover:text-utp-red-dark">Editar</button>
                                    <button className="text-sm font-medium text-gray-500 transition-colors hover:text-utp-red">Eliminar</button>
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
