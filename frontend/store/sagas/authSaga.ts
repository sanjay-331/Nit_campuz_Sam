// FIX: Use namespace import for 'redux-saga/effects' to fix module resolution errors.
import * as sagaEffects from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { loginRequest, loginSuccess, loginFailure, logout, updateUserRequest, updateUserSuccess, updateUserFailure, selectUser, deleteAccountRequest } from '../slices/authSlice';
import { USERS } from '../../constants';
import { User } from '../../types';
import { removeUserRequest } from '../slices/appSlice';

function* handleLoginRequest(action: PayloadAction<string>) {
  try {
    const email = action.payload;
    // Hardcode password matching the seed data
    const password = 'password123';
    
    // Call the new Express API
    const response: Response = yield sagaEffects.call(fetch, 'http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data: { token: string; user: User } = yield sagaEffects.call([response, 'json']);
      // Store token and user
      yield sagaEffects.call([localStorage, 'setItem'], 'lms_token', data.token);
      yield sagaEffects.call([localStorage, 'setItem'], 'lms_user', JSON.stringify(data.user));
      yield sagaEffects.put(loginSuccess(data.user));
    } else {
      const errorData: { message: string } = yield sagaEffects.call([response, 'json']);
      yield sagaEffects.put(loginFailure(errorData.message || 'Invalid email or password.'));
    }
  } catch (error) {
    if (error instanceof Error) {
        yield sagaEffects.put(loginFailure(error.message));
    } else {
        yield sagaEffects.put(loginFailure('An unknown error occurred.'));
    }
  }
}

function* handleLogout() {
    try {
        yield sagaEffects.call([localStorage, 'removeItem'], 'lms_user');
    } catch (error) {
        console.error("Failed to clear user from localStorage", error);
    }
}

function* handleUpdateUserRequest(action: PayloadAction<Partial<User>>) {
    try {
        const currentUser: User | null = yield sagaEffects.select(selectUser);
        if (!currentUser) {
            throw new Error("No user is currently logged in.");
        }

        const updatedUser = { ...currentUser, ...action.payload };
        
        // 1. Update localStorage for persistence
        yield sagaEffects.call([localStorage, 'setItem'], 'lms_user', JSON.stringify(updatedUser));
        
        // 2. Update the in-memory constant (for mock environment)
        const userIndex = USERS.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            Object.assign(USERS[userIndex], updatedUser);
        }

        // 3. Dispatch success to update Redux state
        yield sagaEffects.put(updateUserSuccess(updatedUser as User));

    } catch (error) {
         if (error instanceof Error) {
            yield sagaEffects.put(updateUserFailure(error.message));
        } else {
            yield sagaEffects.put(updateUserFailure('An unknown error occurred during profile update.'));
        }
    }
}

function* handleDeleteAccountRequest() {
    try {
        const currentUser: User | null = yield sagaEffects.select(selectUser);
        if (!currentUser) {
            throw new Error("No user is currently logged in.");
        }
        // Dispatch action to appSaga to handle the data removal
        yield sagaEffects.put(removeUserRequest(currentUser.id));
        // Then, log the user out
        yield sagaEffects.put(logout());
    } catch (error) {
         console.error("Failed to delete account", error);
         // Optionally dispatch a failure action
    }
}


export default function* authSaga() {
  yield sagaEffects.takeLatest(loginRequest.type, handleLoginRequest);
  yield sagaEffects.takeLatest(logout.type, handleLogout);
  yield sagaEffects.takeLatest(updateUserRequest.type, handleUpdateUserRequest);
  yield sagaEffects.takeLatest(deleteAccountRequest.type, handleDeleteAccountRequest);
}