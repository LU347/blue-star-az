"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useToken from "@/hooks/useToken"; // Import the hook
const Profile: React.FC = () => {
    const router = useRouter();
    //const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const { token, isChecking } = useToken(); // Get token & check state

    useEffect(() => {
        if (!isChecking && !token) {
            router.push("/login");
        }
    }, [token, isChecking, router]);

    if (isChecking) return <p className="text-center">Checking authentication...</p>; // Prevent redirect issue

    if (!token) return null; // Redirect already handled
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <h1 className="text-2xl font-bold">User Profile</h1>
        </div>
    );
};

export default Profile;
