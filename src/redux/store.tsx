import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slice/sidebarSlice";
import flatReducer from "./slice/flatSlice";
import unitReducer from "./slice/TowerFlat";
import Tower from "@/components/Forms/Tower";
export const store = configureStore({
    reducer: {
        sidebar: sidebarReducer,
        flats: flatReducer,
        TowerFlats: unitReducer,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
