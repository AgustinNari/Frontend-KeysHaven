import PostCard from "./PostCard";

import { useEffect, useState } from "react";
const PostList = () => {
    const [posts, setPosts] = useState([]); //id, title, body

    const URL = 'https://jsonplaceholder.typicode.com/posts';
    //Como BUENA PRACTICA, declaramos la URL como constante para ir usandola a lo largo del componente

    useEffect(() => {
        fetch(URL)
        .then(response => response.json())
        .then(data => setPosts(data))
        .catch(error => console.error('Error al mostrar los datos:', error));
    }, []);

    return (
        <>  
        <h1>Publicaciones</h1>
        <div>
            {posts.map(post => (
                <PostCard 
                id = {post.id}
                title = {post.title}
                body = {post.body}
                key = {post.id} />
            ))}
        </div>
        </>
    )
}

export default PostList;

//TODO

//IMPORTANTE TODO ESTO PARA HACER PETICIONES AUTENTICADAS

//LOGIN o REGISTER, guardamos el token en el localStorage
localStorage.setItem('jwtToken', data.token);

const token = localStorage.getItem('jwtToken');

const [name, setName] = useState((''));

const [form, setForm] = useState(({name: '', description: ''}));
//TODO ESTO DEBE COINCIDIR CON EL BACKEND, IMPORTANTE ESTO

const [products, setProducts] = useState([]);

const URL = 'localhost:8080/';


const options = {
    method: 'POST',
    header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(form)
};

//TODO
useEffect(() => {
    fetch(`${URL}products`, options)
    .then(response => response.json())
    .then(data => setProducts([...products, data]))
    //USAMOS EL SPREAD OPERATOR PARA NO SOBREESCRIBIR EL ESTADO ANTERIOR
    //PARA QUE NO SE PIERDAN LOS PRODUCTOS ANTERIORES
    .catch(error => { throw Error(error) });
    //IMPORTANTE, REVISAR SI USAR ESE THROW ERROR
    //O SI USAR OTRA FORMA, COMO UN ESTADO DE ERROR, CONSOLE.LOG, ENTRE OTROS
}, []);
    
//TODO
//IMPORTANTE, AL HACER LOGUEO, NO GUARDAR TODO EL USER EN EL LOCALSTORAGE
//PORQUE SE PUEDE ACCEDER A TODO ESTO DESDE LA CONSOLA
//GUARDAR SOLO EL TOKEN, Y POSIBLEMENTE TAMBIEN EL ROL, Y QUIZAS EL ID
//PERO NUNCA LA PASSWORD, NI OTROS DATOS SENSIBLES



//EXTRA DIRECTO DE CLASE:

// localStorage.setItem('jwtToken', data.token)
// const token  = localStorage.getItem('jwtToken')
// const [name, setName] = useState("");
// const [description, setDescription] = useState("");
// const [products, setProducts] = useState([]);
// const [token, setToken] = useState("");
// const URL = "localhost:8080/products";
// const datosAEnviar ={
//     name: name,
//     description: description
// }

// const options = {
//   method: "POST",
//   header: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   },
//   body: JSON.stringify(datosAEnviar),
// };

// useEffect(() => {
//   fetch(URL, options)
//     .then((response) => response.json())
//     .then((data) => {
//       setProducts([...products, {data}]);
//     })
//     .catch((error) => {
//         console.error("Error al obtener los datos: ", error);
//       });
// }, [products]);
