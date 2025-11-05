import { useState } from "react";
import { useDispatch } from "react-redux";
import {updatePost } from "../redux/postSlice";

const EditPostForm = ({currentTitle, currentBody, onClose, id}) => {
    //Recibo las props del componente padre, que es el que tiene la logica de abrir y cerrar el formulario

    const[title, setTitle] = useState(currentTitle)
    const[body, setBody] = useState(currentBody)
    const dispatch = useDispatch()

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(updatePost({id, title, body}))
        onClose() //Cierro el formulario luego de actualizar el post
    }
    return( <>
        <form onSubmit={handleSubmit}>
            <h3>Editar publicaciones</h3>
            <div>
                <label>Título:</label>
                <input type="text" name="titulo" value={title}
                onChange={e => setTitle(e.target.value)} required/> 
                </div>
                <div>
                    <label>Contenido:</label>
                    <input type="text" name="contenido" value={body} onChange={e => setBody(e.target.value)} required/>
                </div>
                <button type="submit">Guardar cambios</button>
                <button type="button" onClick={onClose}>Cancelar</button>
                {/*Acá no usamos un simple cancel, porque lo usamos también para cerrar el formulario al hacer submit,
                por lo que el simple cancel, no sirve para este caso*/}
                {/*Aca, el que tendrá la lógica de cerrar el formulario, tendrá que ser
                el componente padre, esto se debe a que el componente padre es el que tiene la lógica de abrir y cerrar el formulario,*/}
        </form>
    </>

)
}

export default EditPostForm