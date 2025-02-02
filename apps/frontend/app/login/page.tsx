import FormComponent from "@/components/FormComponent/Form";

const Login: React.FC = () => {
    const loginFields = [
        {
            name: "email",
            label: "Email Address",
            type: "email",
            placeholder: "Email Address",
            ariaLabel: "email_address_label",
        },
        {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "Password",
            ariaLabel: "password_label",
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <FormComponent
                title="Log in"
                action="/login"
                formName="loginForm"
                fields={loginFields}
                buttonText="Login"
                linkText="Create Account"
                linkHref="/signup"
                ariaLabel="Log in Form"
            />
        </div>
    );
};

export default Login;