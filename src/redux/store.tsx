import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slice/sidebarSlice";
import flatReducer from "./slice/flatSlice";
import unitReducer from "./slice/TowerFlat";
import Society from "./slice/SocietyFlat";
export const store = configureStore({
    reducer: {
        sidebar: sidebarReducer,
        flats: flatReducer,
        TowerFlats: unitReducer,
        Society: Society,
    },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
