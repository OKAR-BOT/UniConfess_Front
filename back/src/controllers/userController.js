const users = [
    { id: 1, nameUser: 'Maria', user: 'maria_utp', email: 'alice@example.com', password: 'password1', career: 'Ingeniería de Software' },
    { id: 2, nameUser: 'Bob', user: 'bob_utp', email: 'bob@example.com', password: 'password1', career: 'Diseño Gráfico' },
    { id: 3, nameUser: 'Charlie', user: 'charlie_utp', email: 'charlie@example.com', password: 'password1', career: 'Marketing' },
    { id: 4, nameUser: 'David', user: 'david_utp', email: 'david@example.com', password: 'password1', career: 'Contabilidad' },
    { id: 5, nameUser: 'Eve', user: 'eve_utp', email: 'eve@example.com', password: 'password1', career: 'Relaciones Públicas' }
];

// Simulación de base de datos con la propiedad "email" incluida
const confessions = [
    { idPost: 1, userId: 1, username: 'Maria', user: 'maria_utp', email: 'alice@example.com', career: 'Ingeniería de Software', typePost: 'Confesión', content: 'Me gusta alguien de mi clase.', createdAt: "2026-06-19T12:00:00.000Z" }, 
    { idPost: 2, userId: 1, username: 'Maria', user: 'maria_utp', email: 'alice@example.com', career: 'Ingeniería de Software', typePost: 'Pregunta', content: '¿Cuándo es el examen?', createdAt: "2026-06-19T13:00:00.000Z" },        
    { idPost: 3, userId: 2, username: 'Bob', user: 'bob_utp', email: 'bob@example.com', career: 'Diseño Gráfico', typePost: 'Sugerencia', content: 'Más eventos en la u.', createdAt: "2026-06-19T14:00:00.000Z" },      
    { idPost: 4, userId: 3, username: 'Charlie', user: 'charlie_utp', email: 'charlie@example.com', career: 'Marketing', typePost: 'Confesión', content: 'Me siento abrumado.', createdAt: "2026-06-19T15:00:00.000Z" }
];

//mostrar usuarios
const getAllUsers = (req, res) => {
    res.status(200).json(users);
}

//crear usuario
const createUser = (req, res) => {
    const {nameuser, user, email, password, career} = req.body;
    const newUser = {
        id: users.length + 1,
        nameUser: nameuser,
        user: user,
        email: email,
        password: password,
        career: career
    };
    users.push(newUser);
    res.status(201).json(newUser);
}

//publicar confesion
// publicar confesión corregido
const postConfession = (req, res) => {
    const { typePost, content } = req.body;

    // Verificamos si hay una sesión activa
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'No estás autenticado. Inicia sesión.' });
    }

    const usuarioLogueado = req.session.user;

    const newConfession = {
        idPost: confessions.length + 1,
        userId: usuarioLogueado.id,
        username: usuarioLogueado.nameUser,
        career: usuarioLogueado.career,
        email: usuarioLogueado.email,
        typePost: typePost,
        content: content,
        createdAt: new Date().toISOString()
    };

    confessions.push(newConfession);
    res.status(201).json(newConfession);
};

//mostrar todas las confesiones
const getAllConfessions = (req, res) => {
    res.status(200).json(confessions);
}

//login de usuario
const loginUser = (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // GUARDAMOS AL USUARIO EN LA SESIÓN (la cookie se crea sola gracias a express-session)
        req.session.user = {
            id: user.id || user.idUser, // asegúrate de que use el nombre correcto de tu objeto user
            nameUser: user.username || user.user || user.nameUser, // mapealo al nombre que usas en confessions
            career: user.career || "Ingeniería de Sistemas", 
            email: user.email
        };

        res.status(200).json({ message: 'Login exitoso', user: req.session.user });
    } else {
        res.status(401).json({ message: 'Credenciales inválidas' });
    }
};



module.exports = { getAllUsers, createUser, postConfession, getAllConfessions, loginUser, postConfession };