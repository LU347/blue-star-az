"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
// import useToken from "@/hooks/useToken";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { setUser, clearUser } from "@/app/store/slices/authSlice";

import { CircularProgress, Box } from "@mui/material";

export default function Dashboard() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user, token, isChecking } = useSelector((state: RootState) => state.auth);
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

    if (isChecking) return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
        </Box>
    ); // Prevent rendering while checking token

    return (
        <div className="flex">
            <Sidebar role={user?.userType || "admin"} />
            <div className="pl-10 py-5 w-full">
                <h1 className="text-2xl font-bold">Welcome, {user?.firstName}</h1>
                <p>Your role: {user?.userType}</p>
            </div>
        </div>
    );
}
