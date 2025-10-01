import { useState } from "react";
import Todo from "./Todo";

const Form = () => {

    
    //Los estados los manejamos con const
    const[todos, setTodos] = useState([
        {todo: 'Tarea 123'},
    ]);

    const [todo, setTodo] = useState('');

    const handleChange = (event) => {
        setTodo(event.target.value);
    }

    const handleClick = () => {
        //Debemos prevenir que se guarde algo vacio, entonces necesitamos validaciones para esto
        //Primero valida que el input no este vacio, si esta vacio, que haga algo, y si no esta vacio, recien ahi se guarda
        if (todo.trim() === '') {
            alert('Por favor ingrese una tarea');
            return;
        }
        //Importante pensarlo de manera secuencial, primero verifico que no este vacio, y despues lo guardo
        setTodos([...todos, { todo }]); //Spread operator, para no pisar lo que ya teniamos, hacemos una copia de lo que ya teniamos y le agregamos el nuevo valor
        //Los 3 puntos son el spread operator, que copia todo lo que ya teniamos en el array
        //Despues de guardar, limpio el input
        //Aca, NO podemos usar metodos del DOM
    }

    //IMPORTANTE, los formularios, por defecto, recargan la pagina, entonces debemos evitar eso
    //Para eso, usamos el evento onSubmit en el form, y le pasamos una funcion que reciba el evento y le haga preventDefault




    //Todos los hooks empiezan con use
    //Siempre constante, siempre 2 parametros para los estados?

    //Puedo tener tantos estados como quiera en cada componente, pero tampoco mas de 5, porque podria ser demasiado


    const deleteTodo = (index) => {
        const newTodos = [...todos];
        newTodos.splice(index, 1); //Elimina 1 elemento en la posicion index
        setTodos(newTodos);
    }

    return (
        //Vamos a usar map para hacer la asociacion dinamica de las tareas
        //Map recibira 2 parametros, el valor y el indice al que estamos accediendo
        //Importante asignarle un nombre al input
        //En caso de tener más de 1 input, se usería un objeto para manejar los estados
        <>
        <form onSubmit={(e) => e.preventDefault()}>
            <label>Tareas pendientes</label><br/>
            <input type="text" name="todo" onChange={handleChange} placeholder="Ingrese una tarea"/>
            <button onClick={handleClick}>Agregar</button>
        </form>
            {todos.map((value, index) => 
            <Todo todo = {value.todo} key = {index} deleteTodo = {deleteTodo} index = {index}/>
            )}
        </>
        //Cuando itera el map, con key, le asignamos un identificador unico a cada elemento, en este caso usamos index
        //Usamos los props para pasar informacion de un componente padre a un componente hijo
        //El index es necesario para identificar cada tarea, para poder eliminarla    
        //En los props, puedo pasar lo que quiera, no solo strings, tambien funciones, arrays, objetos, etc
    );
};

export default Form;