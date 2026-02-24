import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Permission } from '../../types';
import { RootState } from '../index';
import { USERS } from '../../constants';


export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const getInitialUser = (): User | null => {
    try {
        const storedUser = localStorage.getItem('lms_user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        return null;
    }
};

const initialState: AuthState = {
  user: getInitialUser(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    updateUserRequest: (state, action: PayloadAction<Partial<User>>) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    },
    updateUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteAccountRequest: (state) => {
      state.loading = true;
    }
  },
});

export const { loginRequest, loginSuccess, loginFailure, logout, updateUserRequest, updateUserSuccess, updateUserFailure, deleteAccountRequest } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export const selectUserPermissions = (state: RootState) => state.auth.user?.permissions || [];
export const selectCan = (permission: Permission) => (state: RootState) => state.auth.user?.permissions?.includes(permission) ?? false;


export default authSlice.reducer;