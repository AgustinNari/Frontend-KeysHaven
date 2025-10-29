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
    }
})

export default postSlice.reducer

//Al exportar el slice, siempre nos quedamos con el reducer