import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {User} from "../../types/auth"
// Get token from localStorage on app load
const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

interface AuthState {
    user: User | null;
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
            // Persist token to localStorage
            if (typeof window !== "undefined") {
                localStorage.setItem("token", action.payload.token);
            }
        },
        clearUser: (state) => {
            state.user = null;
            state.token = null;
            state.isChecking = false;
             // Remove token from localStorage
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
            }
        },
        setChecking: (state, action: PayloadAction<boolean>) => {
            state.isChecking = action.payload;
        },
    },
});

export const { setUser, clearUser, setChecking } = authSlice.actions;
export default authSlice.reducer;
