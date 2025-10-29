import PostCard from "./PostCard";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../redux/postSlice";
const PostList = () => {




    // const [posts, setPosts] = useState([]); //id, title, body

    // const URL = 'https://jsonplaceholder.typicode.com/posts';
    // //Como BUENA PRACTICA, declaramos la URL como constante para ir usandola a lo largo del componente

    // useEffect(() => {
    //     fetch(URL)
    //     .then(response => response.json())
    //     .then(data => setPosts(data))
    //     .catch(error => console.error('Error al mostrar los datos:', error));
    // }, []);

    const dispatch = useDispatch();
    //Este dispatch lo usaremos para llamar a la accion
    
    //Al suscribirnos, nos podemos suscribir a una parte especifica del estado
    const {items, error, loading} = useSelector(state => state.posts);
    //Esto lo usaremos para acceder a los datos del estado, podemos tomar lo que necesitemos
    //De esta forma, YA estamos suscriptos a la parte del estado que nos interesa, consumimos solo lo que necesitamos
    //Pero todavia no estamos haciendo ninguna llamada a la api

    useEffect(() => {
        dispatch(fetchPosts());
    }, [dispatch]);
    //Ponemos el dispatch en el array de dependencias, para que se ejecute la accion cada vez que se renderice el componente
    //Para prevenir tambien que se ejecute la accion cada vez que se renderice el componente, y entre en un bucle infinito


    if(loading) return <h1>Cargando publicaciones...</h1>
    if(error) return <h1>Error al cargar las publicaciones {error}</h1>

    return (
        <>  
        <h1>Publicaciones</h1>
        <div>
            {items.map(post => (
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

// //TODO

// //IMPORTANTE TODO ESTO PARA HACER PETICIONES AUTENTICADAS

// //LOGIN o REGISTER, guardamos el token en el localStorage
// localStorage.setItem('jwtToken', data.token);

// const token = localStorage.getItem('jwtToken');

// const [name, setName] = useState((''));

// const [form, setForm] = useState(({name: '', description: ''}));
// //TODO ESTO DEBE COINCIDIR CON EL BACKEND, IMPORTANTE ESTO

// const [products, setProducts] = useState([]);

// const URL = 'localhost:8080/';


// const options = {
//     method: 'POST',
//     header: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//     },
//     body: JSON.stringify(form)
// };

// //TODO
// useEffect(() => {
//     fetch(`${URL}products`, options)
//     .then(response => response.json())
//     .then(data => setProducts([...products, data]))
//     //USAMOS EL SPREAD OPERATOR PARA NO SOBREESCRIBIR EL ESTADO ANTERIOR
//     //PARA QUE NO SE PIERDAN LOS PRODUCTOS ANTERIORES
//     .catch(error => { throw Error(error) });
//     //IMPORTANTE, REVISAR SI USAR ESE THROW ERROR
//     //O SI USAR OTRA FORMA, COMO UN ESTADO DE ERROR, CONSOLE.LOG, ENTRE OTROS
// }, []);
    
// //TODO
// //IMPORTANTE, AL HACER LOGUEO, NO GUARDAR TODO EL USER EN EL LOCALSTORAGE
// //PORQUE SE PUEDE ACCEDER A TODO ESTO DESDE LA CONSOLA
// //GUARDAR SOLO EL TOKEN, Y POSIBLEMENTE TAMBIEN EL ROL, Y QUIZAS EL ID
// //PERO NUNCA LA PASSWORD, NI OTROS DATOS SENSIBLES



// //EXTRA DIRECTO DE CLASE:

// // localStorage.setItem('jwtToken', data.token)
// // const token  = localStorage.getItem('jwtToken')
// // const [name, setName] = useState("");
// // const [description, setDescription] = useState("");
// // const [products, setProducts] = useState([]);
// // const [token, setToken] = useState("");
// // const URL = "localhost:8080/products";
// // const datosAEnviar ={
// //     name: name,
// //     description: description
// // }

// // const options = {
// //   method: "POST",
// //   header: {
// //     "Content-Type": "application/json",
// //     Authorization: `Bearer ${token}`,
// //   },
// //   body: JSON.stringify(datosAEnviar),
// // };

// // useEffect(() => {
// //   fetch(URL, options)
// //     .then((response) => response.json())
// //     .then((data) => {
// //       setProducts([...products, {data}]);
// //     })
// //     .catch((error) => {
// //         console.error("Error al obtener los datos: ", error);
// //       });
// // }, [products]);
