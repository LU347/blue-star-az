import FormComponent from "@/components/FormComponent/Form";

// Address format based on https://support.govx.com/article?id=1176&sectionId=1025

const UserInfo: React.FC = () => {
    const formFields = [
        {
            name: "first_name",
            label: "First Name",
            type: "text",
            placeholder: "First Name",
            ariaLabel: "first_name_label",
        }, 
        {
            name: "last_name",
            label: "Last Name",
            type: "text",
            placeholder: "Last Name",
            ariaLabel: "last_name_label",
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
            ]
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
                { value: "navy", label: "Navy" },
                { value: "space_force", label: "Space Force" }
            ]
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
            //TODO: Replace w/ select?
            name: "state",
            label: "State / Province",
            type: "text",
            placeholder: "State / Province",
            ariaLabel: "state_label",
        },
    ]

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <FormComponent
                title="Info"
                action="/userInfo"
                formName="infoForm"
                fields={formFields}
                buttonText="Submit"
                linkText="View Profile"
                linkHref="/profile"
                ariaLabel="Info Form"
            />
        </div>
    );
};

export default UserInfo;