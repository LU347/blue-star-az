"use client";

import FormComponent from "@/components/FormComponent/Form";
import { signupFields } from "./fields";
import { useState } from "react";

const Signup: React.FC = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        phoneNumber: "",
        firstName: "",
        lastName: "",
        gender: "",
        military_branch: "",
        address_one: "",
        address_two: "",
        city: "",
        zip_code: "",
        country: "",
        state: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

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
                throw new Error(data.message || "Signup failed");
            }

            setSuccess("Signup successful!");
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