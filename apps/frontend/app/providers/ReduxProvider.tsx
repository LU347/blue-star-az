"use client"; // ✅ Required for Redux in Next.js

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/app/store/store"; // Import Redux store

interface ReduxProviderProps {
    children: ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
    return <Provider store={store}>{children}</Provider>;
}
