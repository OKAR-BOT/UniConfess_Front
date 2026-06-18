/**
 * Carreras de pregrado UTP (Universidad Tecnológica del Perú).
 * Fuente orientativa: portal oficial y matrícula UTP.
 * @type {{ name: string, faculty: string }[]}
 */
export const UTP_CAREERS = [
  // Ingeniería
  { name: 'Ingeniería de Software', faculty: 'Ingeniería' },
  { name: 'Ingeniería de Sistemas e Informática', faculty: 'Ingeniería' },
  { name: 'Ingeniería Industrial', faculty: 'Ingeniería' },
  { name: 'Ingeniería Civil', faculty: 'Ingeniería' },
  { name: 'Ingeniería Mecánica', faculty: 'Ingeniería' },
  { name: 'Ingeniería Mecatrónica', faculty: 'Ingeniería' },
  { name: 'Ingeniería Electrónica', faculty: 'Ingeniería' },
  { name: 'Ingeniería Eléctrica y de Potencia', faculty: 'Ingeniería' },
  { name: 'Ingeniería Empresarial', faculty: 'Ingeniería' },
  { name: 'Ingeniería Ambiental', faculty: 'Ingeniería' },
  { name: 'Ingeniería de Minas', faculty: 'Ingeniería' },
  { name: 'Ingeniería de Seguridad Industrial y Minera', faculty: 'Ingeniería' },
  { name: 'Ingeniería de Telecomunicaciones', faculty: 'Ingeniería' },
  { name: 'Ingeniería Aeronáutica', faculty: 'Ingeniería' },
  { name: 'Ingeniería Automotriz', faculty: 'Ingeniería' },
  { name: 'Ingeniería Biomédica', faculty: 'Ingeniería' },
  // Negocios
  { name: 'Administración de Empresas', faculty: 'Negocios' },
  { name: 'Administración y Marketing', faculty: 'Negocios' },
  { name: 'Administración de Negocios Internacionales', faculty: 'Negocios' },
  { name: 'Banca y Finanzas', faculty: 'Negocios' },
  { name: 'Contabilidad y Finanzas', faculty: 'Negocios' },
  { name: 'Administración Hotelera y de Turismo', faculty: 'Negocios' },
  { name: 'Economía', faculty: 'Negocios' },
  // Comunicaciones
  { name: 'Comunicación y Publicidad', faculty: 'Comunicaciones' },
  { name: 'Ciencias de la Comunicación', faculty: 'Comunicaciones' },
  { name: 'Diseño Digital Publicitario', faculty: 'Comunicaciones' },
  // Salud
  { name: 'Enfermería', faculty: 'Salud' },
  { name: 'Obstetricia', faculty: 'Salud' },
  { name: 'Nutrición y Dietética', faculty: 'Salud' },
  { name: 'Odontología', faculty: 'Salud' },
  { name: 'Farmacia y Bioquímica', faculty: 'Salud' },
  { name: 'Tecnología Médica - Terapia Física', faculty: 'Salud' },
  { name: 'Laboratorio Clínico y Anatomía Patológica', faculty: 'Salud' },
  { name: 'Medicina', faculty: 'Salud' },
  // Arquitectura y diseño
  { name: 'Arquitectura y Urbanismo', faculty: 'Arquitectura y Diseño' },
  { name: 'Diseño Profesional de Interiores', faculty: 'Arquitectura y Diseño' },
  // Derecho y humanidades
  { name: 'Derecho', faculty: 'Derecho y Humanidades' },
  { name: 'Psicología', faculty: 'Derecho y Humanidades' },
  { name: 'Educación Inicial', faculty: 'Derecho y Humanidades' },
  { name: 'Educación Primaria', faculty: 'Derecho y Humanidades' },
];

export const UTP_CAREER_NAMES = UTP_CAREERS.map((c) => c.name);

/** @param {string} name */
export function isValidUtpCareer(name) {
  return UTP_CAREER_NAMES.includes(name);
}
