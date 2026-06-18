//simulacion de base de datos (por el momento)
const users = [
    { id: 1, nameUser: 'Maria', user: 'maria_utp', email: 'alice@example.com', password: 'password1', career: 'Ingeniería de Software' },
    { id: 2, nameUser: 'Bob', user: 'bob_utp', email: 'bob@example.com', password: 'password1', career: 'Diseño Gráfico' },
    { id: 3, nameUser: 'Charlie', user: 'charlie_utp', email: 'charlie@example.com', password: 'password1', career: 'Marketing' },
    { id: 4, nameUser: 'David', user: 'david_utp', email: 'david@example.com', password: 'password1', career: 'Contabilidad' },
    { id: 5, nameUser: 'Eve', user: 'eve_utp', email: 'eve@example.com', password: 'password1', career: 'Relaciones Públicas' }
];

//simulacion de base de datos (de confesiones)
const confessions = [
    { idPost: 1, userId: 1, typePost: 'Confesión', content: 'Me gusta alguien de mi clase.' }, 
    { idPost: 2, userId: 1, typePost: 'Pregunta', content: '¿Cuándo es el examen?' },        
    { idPost: 3, userId: 2, typePost: 'Sugerencia', content: 'Más eventos en la u.' },      
    { idPost: 4, userId: 3, typePost: 'Confesión', content: 'Me siento abrumado.' }
]

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
const postConfession = (req, res) => {
    const { typePost, content } = req.body;
    const newConfession = {
        idPost: confessions.length + 1,
        userId: req.params.userId,
        typePost: typePost,
        content: content
    };
    confessions.push(newConfession);
    res.status(201).json(newConfession);
}

//mostrar todas las confesiones
const getAllConfessions = (req, res) => {
    res.status(200).json(confessions);
}

module.exports = { getAllUsers, createUser, postConfession, getAllConfessions };