import axios from 'axios';

// Crear una instancia de Axios
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Cambia esto por tu URL base
    timeout: 10000, // Timeout opcional de 10 segundos
});

// Interceptor de solicitudes
axiosInstance.interceptors.request.use(
    (config) => {
        // Obtener el token de `sessionStorage`
        const token = sessionStorage.getItem('kc-token');

        // Si el token existe, lo añadimos al header `Authorization`
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // Manejar errores de solicitud
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Intentar renovación del token o redirigir a Keycloak
            const refreshToken = document.cookie.includes('refreshToken');
            if (refreshToken) {
                try {
                    // Llama al backend para renovar el token de acceso
                    const { data } = await axios.post('/api/renew-token');
                    sessionStorage.setItem('kc-token', data.accessToken);
                    error.config.headers['Authorization'] = `Bearer ${data.accessToken}`;
                    return axiosInstance(error.config); // Reintentar la solicitud original
                } catch (refreshError) {
                    // Si falla, redirige al flujo de autenticación
                    window.location.href = `/auth/login?redirect=${window.location.pathname}`;
                }
            } else {
                // Redirigir a Keycloak si no hay refreshToken
                //window.location.href = `${import.meta.env.VITE_KC_URL}/realms/Kerno%20360/protocol/openid-connect/auth`;
            }
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;
