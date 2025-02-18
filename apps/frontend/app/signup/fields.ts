
/*
    Required fields:
    email, password, first & last name, gender, branch

    Optional:
    phoneNumber, address fields (since there's different types of military addresses)
    Address format based on https://support.govx.com/article?id=1176&sectionId=1025
*/
export const signupFields = [
    {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "Email Address",
        ariaLabel: "email_address_label",
        required: true
    },
    {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Password",
        ariaLabel: "password_label",
        required: true
    },
    {
        name: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        placeholder: "Password",
        ariaLabel: "confirm_password_label",
        required: true
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
        name: "first_name",
        label: "First Name",
        type: "text",
        placeholder: "First Name",
        ariaLabel: "first_name_label",
        required: true,
    }, 
    {
        name: "last_name",
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
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
        ],
        required: true,
    },
    {
        name: "military_branch",
        label: "Branch",
        type: "select",
        placeholder: "Select Military Branch",
        ariaLabel: "military_branch_label",
        options: [
            { value: "air_force", label: "Air Force" },
            { value: "army", label: "Army" },
            { value: "coast_guard", label: "Coast Guard"},
            { value: "marines", label: "Marines" },
            { value: "national_guard", label: "National Guard" },
            { value: "navy", label: "Navy" },
            { value: "space_force", label: "Space Force" }
        ],
        required: true,
    },
    {
        name: "address_one",
        label: "Address Line 1",
        type: "text",
        placeholder: "USS Nimitz (CVN 68) / PSC 1234 / Unit 7400",
        ariaLabel: "address_one_label",
    },
    {
        name: "address_two",
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
        name: "zip_code",
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
];