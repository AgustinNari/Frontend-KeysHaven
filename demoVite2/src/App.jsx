
import './App.css'
import Form from './components/Form';
import CardView from './views/CardView';
import {Routes, Route, useNavigate} from 'react-router-dom';
import Home from './views/Home';
import Navigation from './views/Navigation';
import Contact from './views/Contact';

function App() {

    const navigate = useNavigate();
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
        </>
    );
}

export default App;