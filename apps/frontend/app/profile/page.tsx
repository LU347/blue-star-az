"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useToken from "@/hooks/useToken"; // Import the hook
const Profile: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const { token, isChecking } = useToken(); // Get token & check state

    useEffect(() => {
        if (!isChecking && !token) {
            router.push("/login");
        }
    }, [token, isChecking, router]);

    useEffect(() => {
        if (token) {
            fetch("http://localhost:4000/api/profile", {
                headers: {      
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setUser(data);
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                });
        }
    }, [token]);

    if (isChecking) return <p className="text-center">Checking authentication...</p>; // Prevent redirect issue

    if (!token) return null; // Redirect already handled
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <h1 className="text-2xl font-bold">User Profile</h1>
            {user ? (
                <div className="mt-4 p-6 border rounded-lg shadow-lg">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                        onClick={() => {
                            localStorage.removeItem("token");
                            router.push("/login");
                        }}
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <p className="text-red-500">User data not found.</p>
            )}
        </div>
    );
};

export default Profile;
