import Link from 'next/link';
import styles from './FormComponent.module.css';

interface FormField {
    name: string;
    label: string;
    type: string;
    placeholder: string;
    ariaLabel: string;
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
}) => {
    return (
        <div className={styles.formPage}>
            <h1 className="text-3xl font-semibold mb-6">{title}</h1>
            <form action={action} name={formName} className={styles.form} aria-label={ariaLabel}>
                {fields.map((field, index) => (
                    <div key={index} className={styles.formField}>
                        <label htmlFor={field.name}>{field.label}</label>
                        <input
                            name={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            aria-labelledby={field.ariaLabel}
                        />
                    </div>
                ))}
                <button type="submit">{buttonText}</button>
            </form>
            <Link href={linkHref}>{linkText}</Link>
        </div>
    )
}

export default FormComponent;