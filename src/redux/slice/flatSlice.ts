import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FlatsInfo {
    name: string;
    address?: string;
    totalFlats: number;
    totalUnsoldFlats: number;
    totalSoldFlats: number;
}

interface FlatState {
    societyFlats: {
        [reraNumber: string]: FlatsInfo;
    };
    towerFlats: {
        [towerId: string]: FlatsInfo;
    };
}

const initialState: FlatState = {
    societyFlats: {},
    towerFlats: {},
};

const flatSlice = createSlice({
    name: "flats",
    initialState,
    reducers: {
        // Add or update flats by RERA number
        updateSocietyFlats(
            state,
            action: PayloadAction<{ reraNumber: string; data: FlatsInfo }>
        ) {
            const { reraNumber, data } = action.payload;
            state.societyFlats[reraNumber] = data;
        },

        // Add or update flats by tower ID
        updateTowerFlats(
            state,
            action: PayloadAction<{ towerId: string; data: FlatsInfo }>
        ) {
            const { towerId, data } = action.payload;
            state.towerFlats[towerId] = data;
        },

        // Increment sold flats for a specific RERA
        incrementSoldSocietyFlat(state, action: PayloadAction<string>) {
            const reraNumber = action.payload;
            const info = state.societyFlats[reraNumber];
            if (info) {
                info.totalFlats += 1;
                info.totalUnsoldFlats += 1;
            }
        },

        // Increment sold flats for a specific tower
        incrementSoldTowerFlat(state, action: PayloadAction<string>) {
            const towerId = action.payload;
            const info = state.towerFlats[towerId];
            if (info) {
                info.totalFlats += 1;
                info.totalUnsoldFlats += 1;
            }
        },
    },
});

export const {
    updateSocietyFlats,
    updateTowerFlats,
    incrementSoldSocietyFlat,
    incrementSoldTowerFlat,
} = flatSlice.actions;

export default flatSlice.reducer;
