import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Home from './pages/Home';
import About from './pages/About';
import Membership from './pages/Membership';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    
    <BrowserRouter>
      
      
      <div className="App">
        <Navbar />

        
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/membership' element={<Membership />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
       
       
       <Footer/>
      </div>

    </BrowserRouter>
  );
}

export default App;
