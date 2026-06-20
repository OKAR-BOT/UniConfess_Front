import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

// Tu URL base unificada
const API_BASE_URL = 'http://localhost:8080/api/users/confessions';

// Función para listar las confesiones
export const listConfessions = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching confessions:', error);
    throw new Error(error.response?.data?.message || 'Error al cargar las publicaciones');
  }
};

export default function ConfessionsApp() {
  // 1. Estados de la Lista de Confesiones
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // 2. Estados del Formulario de Nueva Publicación
  const [typePost, setTypePost] = useState('Confesión');
  const [content, setContent] = useState('');

  // Función para recargar la lista de confesiones
  const refresh = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const data = await listConfessions();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Error al cargar.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 3. Función que maneja el envío del formulario
  const createConfession = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Por favor, escribe algo antes de publicar.");
      return;
    }

    // Estructura los campos tal como los requiera tu backend de Spring Boot / Node
    const nuevaPublicacion = {
      typePost: typePost, // Asegúrate de que tu backend use camelCase o 'tipo' según definiste
      content: content
    };

  try {
  console.log('Enviando publicación...', nuevaPublicacion);

  // CORREGIDO: Le añadimos el tercer parámetro con 'withCredentials'
  const respuesta = await axios.post(
    'http://localhost:8080/api/users/Cconfessions', 
    nuevaPublicacion, 
    { withCredentials: true } // 👈 ¡ESTO ES LO QUE FALTA!
  );
  
  console.log('Respuesta del servidor:', respuesta.data);
  alert('¡Publicación creada con éxito!');

  // Limpiamos el formulario
  setContent('');
  refresh(); // Si tienes la función para recargar la lista
  
} catch (error) {
  console.error('Error al enviar la confesión:', error);
  alert('Hubo un error al intentar guardar la publicación.');
}
    
  };
    

  const AVATAR = 'https://img.freepik.com/vector-premium/ilustracion-plana-vectorial-escala-grases-icono-perfil-usuario-avatar-persona-imagen-perfil-silueta-genero-neutral-apto-perfiles-redes-sociales-iconos-protectores-pantalla-como-plantillax9xa_719432-2210.jpg?semt=ais_hybrid&w=740&q=80';

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* SECCIÓN 1: FORMULARIO */}
      <div className="max-w-xl mx-auto mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>✨</span> Crear nueva publicación
        </h2>

        <form className="space-y-4" onSubmit={createConfession}>
          {/* Selector del Tipo de Confesión */}
          <div>
            <label htmlFor="typePost" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Tipo de publicación
            </label>
            <select
              id="typePost"
              value={typePost}
              onChange={(e) => setTypePost(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500"
            >
              <option value="Confesión">👤 Confesión</option>
              <option value="Pregunta">❓ Pregunta</option>
              <option value="Sugerencia">💡 Sugerencia</option>
            </select>
          </div>

          {/* Textarea para el contenido */}
          <div>
            <label htmlFor="content" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              ¿Qué estás pensando?
            </label>
            <textarea
              id="content"
              rows={4}
              maxLength={1000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu confesión aquí de manera respetuosa..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition resize-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {content.length} / 1000 caracteres
            </div>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            Publicar
          </button>
        </form>
      </div>

      {/* SECCIÓN 2: ESTADOS DE CARGA Y LISTA */}
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center gap-3 py-16 mt-6">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          <span className="text-sm text-gray-500 font-medium">Cargando publicaciones…</span>
        </div>
      ) : loadError ? (
        <div className="max-w-xl mx-auto mt-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium text-center">
          ⚠️ {loadError}
        </div>
      ) : items.length === 0 ? (
        <p className="max-w-xl mx-auto mt-6 text-center text-sm text-gray-400 py-12 border border-dashed rounded-2xl">
          Aún no hay publicaciones. ¡Sé el primero en compartir! 🚀
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((c) => (
            <article key={c.idPost || c.id} className="max-w-xl mx-auto mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="space-y-4">
                
                {/* Encabezado */}
                <div className="flex items-center space-x-3">
                  <img 
                    src={AVATAR} 
                    alt="Avatar" 
                    className="h-10 w-10 rounded-xl border border-gray-200 object-cover shadow-sm" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-sm text-gray-900 truncate">{c.user || 'Anónimo'}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500 font-medium truncate">@{c.email || 'comunidad'}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">Comunidad</p>
                  </div>
                  
                  <span className="text-[11px] font-semibold px-2 py-1 bg-red-50 text-red-600 rounded-lg">
                    {c.typePost || c.tipo}
                  </span>
                </div>

                {/* Cuerpo de la Confesión */}
                <div className="pl-1">
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {c.content || c.contenido}
                  </p>
                </div>

                {/* Barra Central de Interacciones */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-2">
                  <div className="flex items-center space-x-4">
                    <button type="button" className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-red-500">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M21 12a8 8 0 10-14 5.5L4 20l2.5-3A8 8 0 0021 12z" />
                      </svg>
                      <span className="text-xs font-medium tabular-nums">0</span>
                    </button>

                    <button type="button" className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-red-500">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 21s-6.716-4.432-9-8.5C.5 8.5 3 5 7.5 5c2.5 0 4.5 2 4.5 2S14 5 16.5 5 23.5 8.5 21 12.5 12 21 12 21z" />
                      </svg>
                      <span className="text-xs font-medium tabular-nums">0</span>
                    </button>
                  </div>

                  <time className="text-xs text-gray-400 font-medium">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Reciente'}
                  </time>
                </div>

                {/* Carrera */}
                <div className="mt-2 border-t border-gray-100/70 pt-2 flex items-center justify-start gap-1">
                  <span className="text-xs text-gray-400 font-medium">🎓 Carrera:</span>
                  <span className="text-xs font-semibold text-red-600 truncate bg-red-50/50 px-2 py-0.5 rounded-md">
                    {c.career || 'General'}
                  </span>
                </div>

              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}