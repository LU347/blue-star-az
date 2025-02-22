"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const useToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const pathname = usePathname(); // Detects route changes

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
        setIsChecking(false);
    }, [pathname]); // Runs every time the route changes

    return { token, isChecking };
};

export default useToken;
