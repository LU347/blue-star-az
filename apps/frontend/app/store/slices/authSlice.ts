import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Get token from localStorage on app load
const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

interface AuthState {
    user: any | null;
    token: string | null;
    isChecking: boolean;
}

const initialState: AuthState = {
    user: null,
    token: savedToken,
    isChecking: true,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ user: any; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isChecking = false;
        },
        clearUser: (state) => {
            state.user = null;
            state.token = null;
            state.isChecking = false;
        },
        setChecking: (state, action: PayloadAction<boolean>) => {
            state.isChecking = action.payload;
        },
    },
});

export const { setUser, clearUser, setChecking } = authSlice.actions;
export default authSlice.reducer;
