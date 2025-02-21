"use client"; // Ensure it runs in the client

import { useEffect, useState } from "react";

const useToken = () => {
    const [token, setToken] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
        setIsChecking(false); // Token check complete
    }, []);

    return { token, isChecking };
};

export default useToken;
