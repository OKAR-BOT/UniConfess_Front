import http from './http';

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error || fallbackMessage;
}

export async function loginUser(email, password) {
  try {
    const response = await http.post('/auth/login', { email, password });
    return response.data.user;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo iniciar sesion.'));
  }
}

export async function getCurrentUser() {
  try {
    const response = await http.get('/auth/me');
    return response.data.user;
  } catch (error) {
    if (error?.response?.status === 401) {
      return null;
    }

    throw new Error(getErrorMessage(error, 'No se pudo recuperar la sesion.'));
  }
}

export async function logoutUser() {
  try {
    await http.post('/auth/logout');
  } catch (error) {
    throw new Error(getErrorMessage(error, 'No se pudo cerrar sesion.'));
  }
}
