import Link from 'next/link';
import styles from './FormComponent.module.css';

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
    formData: Record<string, string>;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
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
}) => {
    return (
        <div className={styles.formPage}>
            <h1 className="text-3xl font-semibold mb-6">{title}</h1>
            <form action={action} name={formName} className={styles.form} aria-label={ariaLabel} onSubmit={onSubmit}>
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
                                    value={formData[field.name] || ""}
                                    onChange={onChange}
                                    required={field.required}
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