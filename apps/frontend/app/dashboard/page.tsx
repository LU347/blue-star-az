"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { setUser, clearUser } from "@/app/store/slices/authSlice";
import { CircularProgress, Box } from "@mui/material";

export default function Dashboard() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user, token, isChecking } = useSelector((state: RootState) => state.auth);

    // ✅ Redirect to login if token is missing
    useEffect(() => {
        if (!token) {
            router.push("/login");
        }
    }, [token, router]);

    useEffect(() => {
        if (!token || user) return; // ✅ Prevent unnecessary API calls

        const fetchUser = async () => {
            try {
                const res = await fetch("/api/user/fetch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }), // ✅ Send token in body
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || "Network error");
                }
                if (data?.data) dispatch(setUser({ user: data.data, token }));
            } catch (error) {
                console.error("Error:", error);
                dispatch(clearUser());
                router.push("/login");
            }
        };

        fetchUser();
    }, [token, dispatch, router]); // ✅ Removed `user` to avoid unnecessary calls

    if (isChecking || !token) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        ); // ✅ Prevent UI flickering
    }

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
