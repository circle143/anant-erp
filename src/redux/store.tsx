import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slice/sidebarSlice";
import flatReducer from "./slice/flatSlice";
export const store = configureStore({
    reducer: {
        sidebar: sidebarReducer,
        flats: flatReducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
