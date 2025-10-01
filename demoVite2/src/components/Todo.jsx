//Este componente mostrara cada tarea individual, pero de manera dinamica

const Todo = ({todo, deleteTodo, index}) => { //Con esto tenemos el uso de props
    return (
        <>
            <h3>{todo}</h3>
            <button onClick={ () => deleteTodo(index)}>X</button>
        </>
        //IMPORTANTE, SIEMPRE incluir la callback en la funcion ( () => )
    );
};

export default Todo;