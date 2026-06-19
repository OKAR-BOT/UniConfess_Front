export const GetUsers = async () => {
    // Usando una API pública gratuita para pruebas
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) {
        throw new Error('No se pudo obtener los usuarios');
    }
    return response.json();
};

export const CreateUser = async (user) => {
    const response = await fetch('https://jsonplaceholder.typicode.com/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...user,
            // JSONPlaceholder requiere un ID en la respuesta fake, pero lo genera
        }),
    });
    
    if (!response.ok) {
        throw new Error('Error al crear usuario');
    }
    return response.json();
};
