import FormComponent from "@/components/Form";

const Login: React.FC = () => {
    const loginFields = [
        { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Email Address' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
    ];

    return (
        <FormComponent
            action="/login"
            formName="loginForm"
            fields={loginFields}
            buttonText="Login"
            linkText="Create Account"
            linkHref="/signup"
        />
    )
};

export default Login;