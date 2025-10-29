import {configureStore} from '@reduxjs/toolkit';
import postReducer from './postSlice';


export const store = configureStore({
    reducer: {posts: postReducer}, //Objeto mas importante, este reducer, tendra dentro, todos los estados globales
    //A medida que creamos estados, los guardamos aca dentro

    //Ese "posts" de dentro del reducer, debe coincidir con el reducer que creamos
    //Es muy importante que el nombre coincida
});

export default store