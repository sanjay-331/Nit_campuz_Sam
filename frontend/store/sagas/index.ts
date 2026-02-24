// FIX: Use namespace import for 'redux-saga/effects' to fix module resolution errors.
import * as sagaEffects from 'redux-saga/effects';
import authSaga from './authSaga';
import appSaga from './appSaga';
import uiSaga from './uiSaga';

export default function* rootSaga() {
  yield sagaEffects.all([
    authSaga(),
    appSaga(),
    uiSaga(),
  ]);
}
