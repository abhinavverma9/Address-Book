import api from './axios';

export const login = async (username, password) => {
  const params = new URLSearchParams();
  params.append('method', 'login');
  params.append('username', username);
  params.append('password', password);

  const response = await api.post('/Auth.cfc', params);
  return response.data;
};

export const register = async (fullName, email, username, password) => {
  const params = new URLSearchParams();
  params.append('method', 'register');
  params.append('full_name', fullName);
  params.append('email', email);
  params.append('username', username);
  params.append('password', password);

  const response = await api.post('/Auth.cfc', params);
  return response.data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
      const params = new URLSearchParams();
      params.append('method', 'logout');
      params.append('refreshToken', refreshToken);
      try {
        await api.post('/Auth.cfc', params);
      } catch (e) {
        console.error("Logout API call failed", e);
      }
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
