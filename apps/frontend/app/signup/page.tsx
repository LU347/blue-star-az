"use client";

import { useState } from "react";
import FormComponent from "@/components/FormComponent/Form";
import { emailField, otpField, signupFields } from "./fields";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormResponse } from "../types/auth";

const Signup: React.FC = () => {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "otp" | "signup">("email");
    const [email, setEmail] = useState("");

    const handleEmailSubmit = (result: FormResponse) => {
        if (!result.success) {
            toast.error(result.message);
            return;
        }
    
        if (!result.email) {
            toast.error("Email is missing from response.");
            return;
        }
    
        setEmail(result.email);
        toast.success(result.message, { autoClose: 2000 });
        setStep("otp");
    };

    const handleOtpSubmit = (result: FormResponse) => {
        if (!result.success) {
            toast.error(result.message);
            return;
        }
    
        if (!result.otp) {
            toast.error("OTP is missing from response.");
            return;
        }
    
        toast.success("OTP verified", { autoClose: 2000 });
        setStep("signup");
    };
    

    const handleSignupSubmit = (result: FormResponse) => {
        if (!result.success) {
            toast.error(result.message);
            return;
        }
    
        toast.success(result.message, { autoClose: 2000 });
        setTimeout(() => router.push("/profile"), 500);
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
                />
            )}
        </div>
    );
};

export default Signup;
