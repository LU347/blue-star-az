"use client"; // Required for localStorage & useState

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token); // Convert token to boolean (true/false)
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token"); // Clear token
        setIsLoggedIn(false); // Update state
        router.replace("/login"); // Redirect to login
    };

    return (
        <div className="flex justify-between p-4 h-16 rounded-xl border-b-2 border-slate-500">
            <div className="flex items-center">
                <Link href="/" className="text-xl font-bold">
                    Blue Star AZ
                </Link>
            </div>
            <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                    <>
                        <Link href="/profile" className="px-4 py-2 rounded">
                            Profile
                        </Link>
                        <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-500 text-white">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="px-4 py-2 rounded">
                            Login
                        </Link>
                        <Link href="/signup" className="px-4 py-2 rounded">
                            Signup
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
