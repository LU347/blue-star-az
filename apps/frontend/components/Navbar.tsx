"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { setUser, clearUser } from "@/app/store/slices/authSlice";
import { Loader2, LogOut } from "lucide-react"; // Icons

export default function Navbar() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user, token, isChecking } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token || user) return; // ✅ Prevent unnecessary calls

        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/fetch", {
                    method: "POST", // ✅ Change to POST since we're sending a body
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token : token }), // ✅ Send token in the request body
                });
                

                if (!res.ok) throw new Error("Network error");

                const data = await res.json();
                if (data?.data) dispatch(setUser({ user: data.data, token }));
            } catch (error) {
                console.error("Error:", error);
                dispatch(clearUser());
                router.push("/login");
            }
        };

        fetchUser();
    }, [token, user, dispatch, router]);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await fetch("/api/auth/logout", { 
                method: "POST", 
                headers: { "Authorization": `Bearer ${token}` } 
            });

            dispatch(clearUser());
            localStorage.removeItem("token"); // ✅ Fix: Clear token storage

            router.replace("/login");
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (isChecking) return null; // Prevent rendering while checking token

    return (
        <div className="flex justify-between p-4 h-16 rounded-xl border-b-2 border-slate-500">
            <div className="flex items-center">
                <Link href="/dashboard" className="text-xl font-bold">
                    Blue Star AZ
                </Link>
            </div>
            <div className="flex items-center space-x-4">
                {token ? (
                    <>
                        {user ? (
                            <Link href="/profile" className="px-4 py-2 rounded">
                                {`${user.firstName ?? "Guest"} ${user.lastName ?? ""}`.trim()}
                            </Link>
                        ) : (
                            <Loader2 className="animate-spin w-5 h-5" />
                        )}
                        <button 
                            onClick={handleLogout} 
                            disabled={loading} 
                            className="px-2 py-2 flex items-center gap-2 rounded-full bg-transparent text-white hover:bg-gray-700 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <LogOut />}
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
