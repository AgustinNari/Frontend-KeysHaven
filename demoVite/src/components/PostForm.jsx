import { useState } from "react";
import { useDispatch } from "react-redux";
import { createPost } from "../redux/postSlice";

const PostForm = () => {

    const[title, setTitle] = useState('')
    const[body, setBody] = useState('')
    const dispatch = useDispatch()
    //Tengo que importarlo de react-redux, para poder usar el dispatch, porque son de 2 librerias distintas,
    //que no se conocen entre si, entonces, necesito conectarlas de cierta forma

    const handleSubmit = (e) => {
        e.preventDefault(); //Evito que se recargue la pagina al hacer submit
        dispatch(createPost({title, body}))
        //El orden de los parámetros, es el mismo que en la base de datos, title y body,
        //debe coincidir con el orden de los parámetros en el backend,
        //con el orden de la request que hacemos en el backend
        setTitle('')
        setBody('')
    }
    //Este componente, no necesita nada del estado global, solo necesita enviar la información al backend,
    //el reducer es el que se encarga de actualizar el estado global, una vez que se crea el post,
    //Porque ya tengo toda la lógica en el slice, para que cuando se cree el post, se actualice el estado global

    return( <>
        <form onSubmit={handleSubmit}>
            <h3>Crear un nuevo post</h3>
            <div>
                <label>Título:</label>
                <input type="text" name="titulo" value={title}
                onChange={e => setTitle(e.target.value)} required/> 
                {/*Usamos e.target.value para obtener el valor del elemento que dispara el evento, ese elemento es el input*/}
                </div>
                <div>
                    <label>Contenido:</label>
                    <input type="text" name="contenido" value={body} onChange={e => setBody(e.target.value)} required/>
                </div>
                {/*Aca, usamos title y body para los value, porque en la base de datos, esos son los nombres de las columnas,
                entonces esperamos esos nombres de columnas*/}
                <button type="submit">Crear Post</button>
        </form>
        {/*TODO: IMPORTANTE, Todo esto es un formulario controlado, guardamos los valores en los estados, porque si no lo guardo,
                no puedo enviar la informacion al backend, si no lo guardo, no me puedo quedar con ese valor luego.
                Además, al presionar el submit, por defecto, se recarga la pagina, entonces debemos evitar eso,
                para que entre otras cosas, no se pierda la informacion*/}
    </>
    //TODO, IMPORTANTE, ESTOS SE LLAMAN FRAGMENTS, Y PERMITEN DEVOLVER VARIOS ELEMENTOS SIN NECESIDAD DE UN DIV QUE ENVUELVA TODO
    //Luego, al terminar, al analizar desde Redux DevTools, vemos que se actualiza el estado global, y se agrega el nuevo post creado,
    //y en la action en sí de creación, vemos que el payload tiene la data del nuevo post creado
    /*Si reiniciara la app, se volvería a cargar todo desde el backend, y vería el nuevo post creado alli también, pero esto lo quiero evitar, 
    porque quiero que se vea directamente en pantalla sin necesidad de recargar
    para no tener que hacer otra petición al backend y perder tiempo, quiero evitar estar haciendo peticiones innecesarias constantemente, quiero evitar
    estar yendo constantemente al backend, por eso usamos REDUX, para poder manejar el estado global, y solo actualizarlo cuando sea necesario,
    haciendo la menor cantidad de peticiones posibles. Solo haria un GET cuando se necesite, al inicio, pero luego, lo manejaria
    directamente desde el estado global.*/
)
}

export default PostForm