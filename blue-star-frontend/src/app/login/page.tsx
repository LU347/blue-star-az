import FormComponent from "@/components/FormComponent/Form";

const Login: React.FC = () => {
    const loginFields = [
        { name: 'email', label: 'Email Address', type: 'email', placeholder: 'Email Address' },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Password' },
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
            />
        </div>
    )
};

export default Login;