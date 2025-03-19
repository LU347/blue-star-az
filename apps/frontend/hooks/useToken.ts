"use client";
import { useEffect, useState } from "react";

const useToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [refresh, setRefresh] = useState(0); // 🔹 Add refresh state

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token");
            setToken(storedToken);
            setIsChecking(false);

            // Listen for storage changes (cross-tab sync)
            const handleStorageChange = () => {
                setToken(localStorage.getItem("token"));
            };

            window.addEventListener("storage", handleStorageChange);
            return () => window.removeEventListener("storage", handleStorageChange);
        } else {
            setIsChecking(false);
        }
    }, [refresh]); // 🔹 Depend on refresh state

    // 🔹 Function to manually refresh token state
    const refreshToken = () => setRefresh((prev) => prev + 1);

    return { token, isChecking, refreshToken };
};

export default useToken;
