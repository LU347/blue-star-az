"use client";

import Link from 'next/link';
import styles from './FormComponent.module.css';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react'; // 🔹 Import loader icon
import { FormResponse } from '@/app/types/auth';

let API_URL = "http://localhost:3000/api/"; 

interface FormField {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    ariaLabel: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    pattern?: RegExp;
    title?: string;
    display?: string;
}

interface FormComponentProps {
    title: string;
    action: string;
    formName: string;
    fields: FormField[];
    buttonText: string;
    linkText?: string;
    linkHref?: string;
    ariaLabel: string;
    pattern?: RegExp;
    email?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
    onSubmitSuccess?: (response: { result: FormResponse }) => void;
    onSubmitError?: (error: string) => void;
}

const FormComponent: React.FC<FormComponentProps> = ({
    title,
    action,
    formName,
    fields,
    buttonText,
    linkText,
    linkHref,
    ariaLabel,
    email,
    onSubmitSuccess,
    onSubmitError,
}) => {
    /*
        TODO: Use an API router on the frontend to abstract the backend implementation.
        ex: app/api/login/route.ts
    */
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false); // 🔹 Loading state

    useEffect(() => {
        if (email) {
            setFormData((prev) => ({
                ...prev,
                email, // Set the email once, if passed as prop
            }));
        }
    }, [email]); // Only run once when email prop changes

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true); // 🔹 Start loading
        
        try {
            const response = await fetch(API_URL + action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorResult = await response.json();
                if (onSubmitError) onSubmitError(errorResult);
                return;
            }

            const result = await response.json();
            console.log(result);
            if (onSubmitSuccess) onSubmitSuccess(result);
        } catch (error: unknown) {
            const errorMessage = (error as Error).message || 'An error occurred during submission';
            if (onSubmitError) onSubmitError(errorMessage);
        } finally {
            setLoading(false); // 🔹 Stop loading
        }
    };

    return (
        <div className={styles.formPage}>
            <h1 className="text-3xl font-semibold mb-6">{title}</h1>
            <form action={action} name={formName} className={styles.form} aria-label={ariaLabel} onSubmit={handleSubmit}>
                {fields.map((field, index) => (
                    <div key={index} className={styles.formField}>
                        <label htmlFor={field.name} style={{ display: field.display || "block" }}>
                            {field.label}
                            {field.required && <span style={{ color: "red" }}> * </span>}
                        </label>
                        {
                            field.type === "select" ? (
                                <select
                                    name={field.name}
                                    aria-labelledby={field.ariaLabel}
                                    defaultValue=""
                                    onChange={handleChange}
                                >
                                    <option value="">{field.placeholder}</option>
                                    {
                                        field.options?.map((option, idx) => (
                                            <option key={idx} value={option.value}>{option.label}</option>
                                        ))
                                    }
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    aria-labelledby={field.ariaLabel}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    pattern={field.pattern?.source}
                                    title={field.title}
                                    required={field.required}
                                    style={{ display: field.display || "block" }}
                                />
                            )
                        }
                    </div>
                ))}
                <button type="submit" disabled={loading} className="flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : null} {/* 🔹 Spinning loader */}
                    {buttonText}
                </button>
            </form>
            {linkHref && linkText && <Link href={linkHref}>{linkText}</Link>}
        </div>
    );
};

export default FormComponent;
