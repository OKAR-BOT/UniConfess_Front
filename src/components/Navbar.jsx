import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    return (
        <nav className='bg-indigo-900 text-white border-b border-gray-800 px-6 py-4 font-sans'>
            <div className='flex items-center justify-between max-w-7xl mx-auto'>
                <Link to="/">
                    <img width="120" src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg" alt="Logo" className="invert opacity-80 hover:opacity-100 transition" />
                </Link>

                <div className='flex gap-6 items-center text-sm font-medium'>
                    <Link to="/" className="hover:text-indigo-400">Inicio</Link>
                    <Link to="/membership" className="hover:text-indigo-400">Membresía</Link>
                    
                    {isAuth ? (
                        <>
                            <Link to="/dashboard" className="text-indigo-400 font-bold">Dashboard</Link>
                            <button 
                                onClick={handleLogout}
                                className="bg-red-500/10 text-red-500 px-3 py-1 rounded border border-red-500/20 hover:bg-red-500 hover:text-white transition"
                            >
                                Salir
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-500 transition">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;