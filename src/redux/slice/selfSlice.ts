import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelfInfo {
    name: string;
    gst: string;
    logo: string;
    file: File | null;
}

const initialState: SelfInfo = {
    name: "",
    gst: "",
    logo: "",
    file: null,
};

const selfSlice = createSlice({
    name: "self",
    initialState,
    reducers: {
        // Update full self data
        updateSelf(state, action: PayloadAction<SelfInfo>) {
            return { ...state, ...action.payload };
        },

        // Update name
        setName(state, action: PayloadAction<string>) {
            state.name = action.payload;
        },

        // Update GST
        setGST(state, action: PayloadAction<string>) {
            state.gst = action.payload;
        },

        // Update logo
        setLogo(state, action: PayloadAction<string>) {
            state.logo = action.payload;
        },

        // Update file
        setFile(state, action: PayloadAction<File | null>) {
            state.file = action.payload;
        },
    },
});

export const { updateSelf, setName, setGST, setLogo, setFile } =
    selfSlice.actions;

export default selfSlice.reducer;
