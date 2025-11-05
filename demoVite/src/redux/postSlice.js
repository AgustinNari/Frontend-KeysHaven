import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const URL = 'https://jsonplaceholder.typicode.com/posts';

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => 
{
    const {data} = await axios.get(URL);
    //Primero, va a esperar que se resuelva la promesa, y despues, vamos a asignarle el data que esta en el response
    return data
}
)

    //POR CONVENCION, PARA EL NOMBRE DEL THUNK, VAMOS A PONER LO ULTIMO DE LA URL PRIMERO / Y LUEGO EL NOMBRE DEL METODO

    //Vamos a volverlo asincrono

    //En esto, manejaremos promesas, que son objetos, con una propiedad data, entonces, la puedo desestructurar





export const createPost = createAsyncThunk('posts/createPost', async (newPost) => {
    const {data} = await axios.post(URL, newPost);
    return data
})
//Si todo salio bien, el payload, va a tener la data que me devuelve la peticion, de lo que acabamos de crear
//Ahora, tenemos que guardar esa data en el estado global


export const updatePost = createAsyncThunk('posts/updatePost', async (updatedPost) => {
    const {id, title, body} = updatedPost
    const {data} = await axios.put(`${URL}/${id}`, {title, body});
    //TODO, IMPORTANTE, Usamos template strings para armar la URL dinamicamente, con el id del post que queremos actualizar
    //Usamos estos porque es más prolijo que concatenar con +, además, es más facil de leer
    //Si no pongo el await, no espera a resolver la promesa, y me devuelve una promesa pendiente, entonces en la data, no tengo la data que espero
    return data
})



const postSlice = createSlice({
    name : 'posts', //Este es el nombre del estado global, aca guardaremos todos los posts
    initialState : {
        items : [],
        loading : false,
        error : null,
        itemId : {}, //Esto podria ser para por ejemplo, traer productos por id
        filterItem: {} //Esto podria ser para traer productos por filtro por ejemplo
    },
    reducers : {
        //Aca, vamos a guardar todo lo de operaciones y funciones sincronas
        //Por ejemplo, para filtrar en front, para manejar carrito desde front, y demas, que no necesitan informacion del backend para funcionar
        //Pero que necesitan ese estado global
        //SOLO MANEJA OPERACIONES SINCRONAS
    },
    extraReducers:(builder) => {
        //Aca tendremos todas las operaciones asincronas
        //VAMOS A TENER 1 REDUCER, POR CADA ESTADO BASE DE LA PROMESA
        //Me permite agregar casos de uso
        
        builder
        .addCase(fetchPosts.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchPosts.fulfilled, (state, action) => {
            //La accion, devuelve la data, y me quedo con eso, son los resultados de la peticion
            state.loading = false;
            state.items = action.payload;
            //Siempre que salga todo bien, me interesa quedarme con la data, con el payload
        })
        .addCase(fetchPosts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(createPost.fulfilled, (state, action) => {
            state.loading = false; //Paso a no estar en loading, entonces aclaro que loading es false
            state.items = [...state.items, action.payload];
            //Cuando creo un post, quiero agregarlo a mi estado global, entonces hago un spread de los items que ya tenia, y le agrego el nuevo que viene en el payload
            //No hacemos un push, porque estaría subiendo lo mismo que ya teniamos, porque antes nunca habíamos inicializado ese estado
            //Entonces, tenemos que hacer un spread, como para inicializar el array, y le agregamos el nuevo item
            //TODO, IMPORTANTE ESTO ÚLTIMO
        })
        //Esto permite que lo que creo, lo veo directamente en pantalla, sin necesidad de recargar o hacer otra peticion
        .addCase(updatePost.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.items.findIndex(post => post.id === action.payload.id); 
            //FindIndex, busca dentro del array, el post que tenga el mismo id que el que me vino en el payload, si encuentra ese post, me devuelve el indice de dentro del array, sino, me devuelve -1
            //Es decir, son 2 indices o ids diferentes, el id del post en la base de datos, y el indice dentro del array, necesitamos el segundo para actualizar el estado global
            if (index !== -1){
                state.items[index] = action.payload;
            }
            //Si el indice es -1, significa que no encontre el post, entonces, no lo actualizo
    })
    /*Lo mande a la BD, anduvo todo bien y me devuelve el post actualizado, con la data que le mande, y ahora
    tengo que actualizar el estado global, entonces, tengo que buscar el post que quiero actualizar dentro
    de la lista de posts, y actualizarlo, y eso lo hacemos con findIndex, usando el id */
    }
})

export default postSlice.reducer

//Al exportar el slice, siempre nos quedamos con el reducer