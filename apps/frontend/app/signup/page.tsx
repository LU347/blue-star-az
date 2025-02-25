"use client";

import FormComponent from "@/components/FormComponent/Form";
import { signupFields } from "./fields";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface SignupResponse {
    message: string;
    status: string;
}

const Signup: React.FC = () => {
    const router = useRouter();

    const handleSignupSuccess = (result: SignupResponse) => {
        toast.success(result.message, { autoClose: 2000 });
        setTimeout(() => router.push('/profile'), 500);
    }

    const handleSignupError = (error: string) => {
        toast.error(error)
    }

    return (
        <div className="flex flex-col items-center justify-center h-auto m-8">
            <FormComponent
                title="Create an Account"
                action="register"
                formName="signupForm"
                fields={signupFields}
                buttonText="Sign Up"
                linkText="Already have an account? Login"
                linkHref="/login"
                ariaLabel="Sign Up Form"
                onSubmitSuccess={handleSignupSuccess}
                onSubmitError={handleSignupError}
            />
        </div>
    );
};

export default Signup;