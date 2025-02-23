"use client";
import Link from 'next/link';
import styles from './FormComponent.module.css';
import { useState } from 'react';
import { Loader2 } from 'lucide-react'; // 🔹 Import loader icon

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
    formData: Record<string, string>;
    pattern?: RegExp;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
    onSubmitSuccess?: (result: any) => void;
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
    formData,
    onChange,
    onSubmit,
    onSubmitSuccess,
    onSubmitError,
}) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // 🔹 Loading state
    const apiUrl = process.env.NEXT_PUBLIC_PRODUCTION_API_URL;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true); // 🔹 Start loading
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);
        
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
            } else {
                setError(null);
                if (onSubmitSuccess) onSubmitSuccess(result);
            }
        } catch (err) {
            setError('An error occurred during submission');
            if (onSubmitError) onSubmitError('An error occurred during submission');
        } finally {
            setLoading(false); // 🔹 Stop loading
        }
    };
}) => {  
    return (
        <div className={styles.formPage}>
            <h1 className="text-3xl font-semibold mb-6">{title}</h1>
            <form action={action} name={formName} className={styles.form} aria-label={ariaLabel} onSubmit={handleSubmit}>
                {fields.map((field, index) => (
                    <div key={index} className={styles.formField}>
                        <label htmlFor={field.name}>
                            {field.label}
                            {field.required && <span style={{ color: "red" }}> * </span>}
                        </label>
                        {
                            field.type === "select" ? (
                                <select
                                    name={field.name}
                                    aria-labelledby={field.ariaLabel}
                                    defaultValue=""
                                    onChange={onChange}
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
                                    onChange={onChange}
                                    pattern={field.pattern?.source}
                                    title={field.title}
                                    required={field.required}
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
            <Link href={linkHref}>{linkText}</Link>
        </div>
    );
};

export default FormComponent;
