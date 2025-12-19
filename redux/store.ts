import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from './slices/bookingSlice';
import { employeeApi } from "./api/employeeApi";
import { roomApi } from "./api/roomApi";
import { bookingsApi } from "./api/bookingsApi";
import { wishlistApi } from "./api/wishlistApi";

export const store = configureStore({
    reducer: {
        booking: bookingReducer,
        [employeeApi.reducerPath]: employeeApi.reducer,
        [roomApi.reducerPath]: roomApi.reducer,
        [bookingsApi.reducerPath]: bookingsApi.reducer,
        [wishlistApi.reducerPath]: wishlistApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(employeeApi.middleware).concat(roomApi.middleware).concat(bookingsApi.middleware).concat(wishlistApi.middleware),

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;