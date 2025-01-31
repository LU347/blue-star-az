import Link from 'next/link';

interface FormField {
    name: string;
    label: string;
    type: string;
    placeholder: string;
}

interface FormComponentProps {
    action: string;
    formName: string;
    fields: FormField[];
    buttonText: string;
    linkText: string;
    linkHref: string;
}

const FormComponent: React.FC<FormComponentProps> = ({
    action,
    formName,
    fields,
    buttonText,
    linkText,
    linkHref,
}) => {
    return (
        <div className="formPage">
            <form action={action} name={formName}>
                {fields.map((field, index) => (
                    <div key={index} className="formField">
                        <label htmlFor={field.name}>{field.label}</label>
                        <input
                            name={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
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