import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from './slices/bookingSlice';
import { employeeApi } from "./api/employeeApi";
import { roomApi } from "./api/roomApi";

export const store = configureStore({
    reducer: {
        booking: bookingReducer,
        [employeeApi.reducerPath]: employeeApi.reducer,
        [roomApi.reducerPath]: roomApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(employeeApi.middleware).concat(roomApi.middleware),

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;