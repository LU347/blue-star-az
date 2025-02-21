"use client";

import FormComponent from "@/components/FormComponent/Form";
import { signupFields } from "./fields";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Signup: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        gender: "",
        branch: "",
        addressLineOne: "",
        addressLineTwo: "",
        city: "",
        zipCode: "",
        country: "",
        state: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!formData.email || !formData.password) {
            setError("Email and password are required.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setSuccess("Signup successful!");

            setTimeout(() => {
                router.push("/profile")
            }, 2000);
            
        } catch(err) {
            if (err instanceof Error) {
                setError(err.message || "An error occurred");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-auto m-8">
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}

            <FormComponent
                title="Create an Account"
                action="/signup"
                formName="signupForm"
                fields={signupFields}
                buttonText={loading ? "Signing Up..." : "Sign Up"}
                linkText="Already have an account? Login"
                linkHref="/login"
                ariaLabel="Sign Up Form"
                onSubmit={handleSubmit}
                onChange={handleChange}
                formData={formData}
            />
        </div>
    );
};

export default Signup;