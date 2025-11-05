
import './App.css'
import Form from './components/Form';
import CardView from './views/CardView';
import {Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import Home from './views/Home';

import Navigation from './views/Navigation';
import Contact from './views/Contact';
import PostList from './components/PostList';

function App() {

    const navigate = useNavigate();
    const location = useLocation();
    
    const handleClick = () => {
        navigate('/contact');
    }
    return (
        <>
            <Navigation/>
            <Routes>
                <Route path='/home' element={<Home/>}/>
                <Route path ='/contact' element={<Contact/>}/>
            </Routes>
            <button onClick={handleClick}> Ir a contactos </button>
            <p>Estás en la ruta: {location.pathname}</p>
        </>
    );
}

export default App;