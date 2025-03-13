
/*
    Required fields:
    email, password, first & last name, gender, branch, phoneNumber

    Optional:
    address fields (since there's different types of military addresses)
    Address format based on https://support.govx.com/article?id=1176&sectionId=1025
*/

const emailPattern = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
const emailTitle = "Please enter a valid email address"

const passPattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
const passTitle = "Password must at least be 8 characters long and include at least one uppercase later, one lowercase letter, one number, and one special character.";
export const signupFields = [
    {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "Email Address",
        ariaLabel: "email_address_label",
        required: true,
        pattern: emailPattern,
        title: emailTitle
    },
    {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Password",
        ariaLabel: "password_label",
        required: true,
        pattern: passPattern,
        title: passTitle
    },
    {
        name: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        placeholder: "Password",
        ariaLabel: "confirm_password_label",
        required: true,
        pattern: passPattern,
        title: passTitle
    },
    {
        name: "phoneNumber",
        label: "Phone Number",
        type: "tel",
        placeholder: "Phone Number",
        ariaLabel: "phone_number_label",
        required: true,

    },
    {
        name: "firstName",
        label: "First Name",
        type: "text",
        placeholder: "First Name",
        ariaLabel: "first_name_label",
        required: true,
    }, 
    {
        name: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Last Name",
        ariaLabel: "last_name_label",
        required: true,
    },
    {
        name: "gender",
        label: "Gender",
        type: "select",
        placeholder: "Select Gender",
        ariaLabel: "gender_label",
        options: [
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
        ],
        required: true,
    },
    {
        name: "branch",
        label: "Branch",
        type: "select",
        placeholder: "Select Military Branch",
        ariaLabel: "military_branch_label",
        options: [
            { value: "AIR_FORCE", label: "Air Force" },
            { value: "ARMY", label: "Army" },
            { value: "COAST_GUARD", label: "Coast Guard"},
            { value: "MARINES", label: "Marines" },
            { value: "NATIONAL_GUARD", label: "National Guard" },
            { value: "NAVY", label: "Navy" },
            { value: "SPACE_FORCE", label: "Space Force" }
        ],
        required: true,
    },
    {
        name: "addressLineOne",
        label: "Address Line 1",
        type: "text",
        placeholder: "USS Nimitz (CVN 68) / PSC 1234 / Unit 7400",
        ariaLabel: "address_one_label",
    },
    {
        name: "addressLineTwo",
        label: "Address Line 2",
        type: "text",
        placeholder: "DPO, AE, 09498-0048 / APO AE 09204-1234",
        ariaLabel: "address_two_label"
    },
    {
        name: "city",
        label: "City / Town",
        type: "text",
        placeholder: "City / Town",
        ariaLabel: "city_label",
    },
    {
        name: "zipCode",
        label: "Zip Code",
        type: "text",
        placeholder: "Zip Code",
        ariaLabel: "zip_code_label"
    },
    {
        name: "country",
        label: "Country",
        type: "text",
        placeholder: "Country",
        ariaLabel: "country_label",
    },
    {
        name: "state",
        label: "State / Province",
        type: "text",
        placeholder: "State / Province",
        ariaLabel: "state_label",
    },
    {
        name: "otp",
        label: "One-Time-Passcode",
        type: "input",
        placeholder: "6-digit OTP Code",
        ariaLabel: "otp_label",
        display: "none"
    }
];