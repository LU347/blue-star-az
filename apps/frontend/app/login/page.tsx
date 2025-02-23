"use client";
import FormComponent from "@/components/FormComponent/Form";
import { useRouter } from 'next/navigation'; // For redirect
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LoginResponse {
    token: string;
    expiresIn?: number;
}

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

    const handleLoginSuccess = (result: LoginResponse) => {
        if (!result.token) {
            throw new Error('Invalid login response: missing token');
        }
        localStorage.setItem('token', result.token);
        toast.success("Login successful! Redirecting...", { autoClose: 2000 });
        setTimeout(() => router.push('/profile'), REDIRECT_DELAY);
    };

    const handleLoginError = (error: string) => {
        toast.error(error);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <FormComponent
                title="Log in"
                action="/api/auth/login"
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