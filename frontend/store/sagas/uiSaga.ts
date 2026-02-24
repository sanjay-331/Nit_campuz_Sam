// FIX: Use namespace import for 'redux-saga/effects' to fix module resolution errors.
import * as sagaEffects from 'redux-saga/effects';
import { showToast, hideToast } from '../slices/uiSlice';

function* handleShowToast() {
    yield sagaEffects.delay(5000);
    yield sagaEffects.put(hideToast());
}

export default function* uiSaga() {
    yield sagaEffects.takeLatest(showToast.type, handleShowToast);
}
