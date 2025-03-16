"use client";

import { useEffect, useState } from "react";
import FormComponent from "@/components/FormComponent/Form";
import { emailField, otpField, signupFields } from "./fields";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormResponse } from "../types/auth";

const Signup: React.FC = () => {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "otp" | "signup">("email");
    const [email, setEmail] = useState("");

    const handleEmailSubmit = (response: { result: FormResponse }) => {
        const { result } = response;
        
        if (!result.success) {
            toast.error(result.message);
            return;
        }
    
        if (!result.email) {
            toast.error("Email is missing from response.");
            return;
        }
    
        setEmail(result.email);
        console.log(email);
        toast.success(result.message, { autoClose: 2000 });
    };

    // Use `useEffect` to transition to OTP step only after email is updated
    useEffect(() => {
        if (email && step === "email") {
            setStep("otp");  // Only transition to OTP if email has been set
        }
    }, [email, step]);  // Dependency on both `email` and `step`

    const handleOtpSubmit = (response: { result: FormResponse }) => {
        const { result } = response;

        if (!result.success) {
            toast.error(result.message);
            return;
        }
        
        toast.success("OTP verified", { autoClose: 2000 });
        setStep("signup");
    };
    
    const handleSignupSubmit = (response: { result: FormResponse }) => {
        const { result } = response;
        console.log("Hello");
        console.log(result);
    
        // Handle success response
        if (result.status === 'success') {
            toast.success(result.message, { autoClose: 2000 });
            setTimeout(() => router.push("/profile"), 500);  // Navigate to profile after success
            return;
        }
    
        // Handle error response from backend
        if (result.error) {
            toast.error(result.error);  // Show the error message received from backend
            return;
        }
    
        // Fallback in case the response structure is unexpected
        toast.error("An unknown error occurred during signup.");
    };

    return (
        <div className="flex flex-col items-center justify-center h-auto m-8">
            {step === "email" && (
                <FormComponent
                    title="Enter Your Email"
                    action="check-email"
                    formName="emailForm"
                    fields={emailField}
                    buttonText="Send OTP"
                    onSubmitSuccess={handleEmailSubmit}   
                    ariaLabel="Email Verification Form"             
                />
            )}
            {step === "otp" && (
                <FormComponent
                    title="Enter OTP"
                    action="verify-otp"
                    formName="otpForm"
                    fields={otpField}
                    buttonText="Verify OTP"
                    onSubmitSuccess={handleOtpSubmit}
                    ariaLabel="OTP Verification Form"
                    email={email}
                />
            )}
            {step === "signup" && (
                <FormComponent
                    title="Create an Account"
                    action="register"
                    formName="signupForm"
                    fields={signupFields}
                    buttonText="Sign Up"
                    linkText="Already have an account? Login"
                    linkHref="/login"
                    ariaLabel="Sign Up Form"
                    onSubmitSuccess={handleSignupSubmit}
                    email={email}
                />
            )}
        </div>
    );
};

export default Signup;
