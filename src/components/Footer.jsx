function Footer() {
    return (
        <footer className="bg-indigo-900 text-white py-8 border-t border-gray-800 font-sans mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start">
                        <span className="text-xl font-bold tracking-wide">
                            Confesiones UTP
                        </span>
                        <p className="text-sm text-indigo-200 mt-2 text-center md:text-left max-w-sm">
                            El rincón donde los estudiantes comparten sus secretos, anécdotas y pensamientos.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-indigo-100">
                        <a href="/" className="hover:text-indigo-400 transition-colors">
                            Inicio
                        </a>
                        <a href="/reglas" className="hover:text-indigo-400 transition-colors">
                            Reglas
                        </a>
                        <a href="/privacidad" className="hover:text-indigo-400 transition-colors">
                            Privacidad
                        </a>
                    </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-indigo-300">
                    <p>&copy; {new Date().getFullYear()} Confesiones UTP. Todos los derechos reservados.</p>
                    <p className="flex items-center gap-1">
                        Hecho con <span className="text-red-500 animate-pulse">❤️</span> para la comunidad
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;