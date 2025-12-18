import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../api/authService';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { username, password } = credentials;
      const response = await authService.login(username, password);
      console.log("Login API Response:", response);
      
      const success = response.success || response.SUCCESS;
      
      if (success) {
        const user = response.user || response.USER;
        const token = response.token || response.TOKEN;
        const refreshToken = response.refreshToken || response.REFRESHTOKEN || response.refreshtoken;

        if (!user) {
            console.error("User object missing in login response", response);
        }

        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        return { user: user, token: token };
      } else {
        return rejectWithValue(response.message || response.MESSAGE);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { fullName, email, username, password } = userData;
      const response = await authService.register(fullName, email, username, password);
      if (response.success) {
         // Auto-login or just return success? 
         // For now, assuming register just creates account
         return response;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with local cleanup even if API fails
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return null;
  }
);

// Helper to check existing session
const loadUserFromStorage = () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (user && token) {
        return { user: JSON.parse(user), token, isAuthenticated: true };
    }
    return { user: null, token: null, isAuthenticated: false };
};

const initialState = {
  ...loadUserFromStorage(),
  loading: false,
  error: null,
  registrationSuccess: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetRegistration: (state) => {
        state.registrationSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, resetRegistration } = authSlice.actions;
export default authSlice.reducer;
