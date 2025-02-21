"use client";
import Link from 'next/link';
import styles from './FormComponent.module.css';

import { useState } from 'react';

interface FormField {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    ariaLabel: string;
    options?: { value: string; label: string }[];
    required?: boolean;
}

interface FormComponentProps {
    title: string;
    action: string;
    formName: string;
    fields: FormField[];
    buttonText: string;
    linkText: string;
    linkHref: string;
    ariaLabel: string;
    onSubmitSuccess?: (result: any) => void; // Callback for success
    onSubmitError?: (error: string) => void; // Callback for error
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
    onSubmitSuccess,
    onSubmitError,
}) => {
    const [error, setError] = useState<string | null>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("ee");
        const formData = new FormData(e.currentTarget);
        
        const data = Object.fromEntries(formData);
        console.log(data, apiUrl+action);

        try {
            const response = await fetch(apiUrl + action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) {
                const errorMsg = result.error || 'Submission failed';
                setError(errorMsg);
                if (onSubmitError) onSubmitError(errorMsg);
                return;
            }

            setError(null); // Clear any previous error
            if (onSubmitSuccess) onSubmitSuccess(result); // Pass result to parent
        } catch (err) {
            const errorMsg = 'An error occurred during submission';
            setError(errorMsg);
            if (onSubmitError) onSubmitError(errorMsg);
        }
    };
    return (
        <div className={styles.formPage}>
            <h1 className="text-3xl font-semibold mb-6">{title}</h1>
            <form   onSubmit={handleSubmit} name={formName} className={styles.form} aria-label={ariaLabel}>
                {fields.map((field, index) => (
                    <div key={index} className={styles.formField}>
                        <label htmlFor={field.name}>
                            {field.label}
                            {field.required && <span style={{ color: 'red' }}> * </span>}
                        </label>
                        {
                            field.type === "select" ? (
                                <select
                                    name={field.name}
                                    aria-labelledby={field.ariaLabel}
                                    defaultValue=""
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
                                    name={field.name}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    aria-labelledby={field.ariaLabel}
                                />
                            )
                        }

                    </div>
                ))}
                <button type="submit">{buttonText}</button>
            </form>
            <Link href={linkHref}>{linkText}</Link>
        </div>
    )
}

export default FormComponent;