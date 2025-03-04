"use client";

import FormComponent from "@/components/FormComponent/Form";
import { useRouter } from 'next/navigation'; // For redirect
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FormResponse } from "../types/auth";

const Login: React.FC = () => {
    const loginFields = [
        {
            name: "email",
            label: "Email Address",
            type: "email",
            placeholder: "Email Address",
            ariaLabel: "email_address_label",
            required: true
        },
        {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "Password",
            ariaLabel: "password_label",
            required: true
        },
    ];
    const router = useRouter();
    const REDIRECT_DELAY = 500;
    
    const handleLoginSuccess = (result: FormResponse) => {
        if (result.data && result.data.token) {
            const token = result.data.token
            localStorage.setItem('token', token);
            toast.success("Login successful! Redirecting...", { autoClose: 2000 });
            setTimeout(() => router.push('/profile'), REDIRECT_DELAY);
        } else {
            console.error('Token not received');
            toast.error("Error logging in, please try again", { autoClose: 2000 });
        }
    };
    const handleLoginError = (error: string) => {
        toast.error(error);
    };
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <FormComponent
                title="Log in"
                action="login"
                formName="loginForm"
                fields={loginFields}
                buttonText="Login"
                linkText="Create Account"
                linkHref="/signup"
                ariaLabel="Log in Form"
                onSubmitSuccess={handleLoginSuccess}
                onSubmitError={handleLoginError}
            />
        </div>
    );
};

export default Login;