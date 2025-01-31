import FormComponent from "@/components/FormComponent/Form";

const Signup: React.FC = () => {
    const signupFields = [
        {
            name: "email",
            label: "Email Address",
            type: "email",
            placeholder: "Email Address",
        },
        {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "Password",
        },
        {
            name: "confirmPassword",
            label: "Confirm Password",
            type: "password",
            placeholder: "Password",
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
            />
        </div>
    );
};

export default Signup;
