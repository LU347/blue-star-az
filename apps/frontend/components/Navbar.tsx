"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useToken from "@/hooks/useToken"; // Import your hook
import { Loader2 } from "lucide-react"; // 🔹 Import spinner icon

export default function Navbar() {
    const { token, isChecking } = useToken();
    const router = useRouter();
    const [loading, setLoading] = useState(false); // 🔹 Logout loader state

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true); // Show loader
        
        try {
            localStorage.removeItem("token");
            await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
            router.replace("/login"); // Redirect after logout
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setLoading(false); // Hide loader
        }
    };

    if (isChecking) return null; // Don't render until token check is complete

    return (
        <div className="flex justify-between p-4 h-16 rounded-xl border-b-2 border-slate-500">
            <div className="flex items-center">
                <Link href="/" className="text-xl font-bold">
                    Blue Star AZ
                </Link>
            </div>
            <div className="flex items-center space-x-4">
                {token ? (
                    <>
                        <Link href="/profile" className="px-4 py-2 rounded">
                            Profile
                        </Link>
                        <button 
                            onClick={handleLogout} 
                            disabled={loading} 
                            className="px-4 py-2 rounded bg-red-500 text-white flex items-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin w-5 h-5" />} {/* 🔹 Show loader */}
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
