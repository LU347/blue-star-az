import FormComponent from "@/components/FormComponent/Form";

const Signup: React.FC = () => {
    const signupFields = [
        {
            name: "email",
            label: "Email Address",
            type: "email",
            placeholder: "Email Address",
            ariaLabel: 'email_address_label'
        },
        {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "Password",
            ariaLabel: 'password_label'
        },
        {
            name: "confirmPassword",
            label: "Confirm Password",
            type: "password",
            placeholder: "Password",
            ariaLabel: 'confirm_password_label'
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <FormComponent
                title="Create an Account"
                action="/signup"
                formName="signupForm"
                fields={signupFields}
                buttonText="Sign Up"
                linkText="Already have an account? Login"
                linkHref="/login"
                ariaLabel="Sign Up Form"
            />
        </div>
    );
};

export default Signup;
