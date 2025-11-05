import { useState } from "react";
import EditPostForm from "./EditPostForm";

const PostCard = ({ id, title, body }) => {

    const [isEditing, setIsEditing] = useState(false);

    return (
        //Queremos hacer un renderizado condicional, dependiendo de si se presiona para editar o no (o si se cancela luego de editar)
    
    
    <>

    { isEditing ? (
        <EditPostForm
            currentTitle={title}
            currentBody={body}
            onClose={() => setIsEditing(false)}
            id={id}
        />
    ): (
        <>
            <h4>{id}</h4>
            <h4>{title}</h4>
            <h4>{body}</h4>
            <button onClick={() => setIsEditing(true)}>Editar</button>
            {/*Aca hay que usar una arrow function porque no queremos que se ejecute la funcion cuando se renderice el componente,
            es una función callback y no una normal, porque se ejecuta después, y porque es anónima, no está definida, no está guardada en ninguna variable.
            Por eso usamos una arrow function, se podría definir, pero ahora mismo no es necesario*/}
        </>
    )}   

    </>
    );
};

export default PostCard;