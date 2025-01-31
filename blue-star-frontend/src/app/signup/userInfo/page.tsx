import FormComponent from "@/components/FormComponent/Form";

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
            name: "country",
            label: "Country / Region",
            type: "select",
            placeholder: "Select Country",
            ariaLabel: "country_label",
            //TODO: Add more countries
            options: [
                { value: "us", label: "United States" },
                { value: "australia", label: "Australia" },
                { value: "bahrain", label: "Bahrain" },
                { value: "belgium", label: "Belgium" },
                { value: "djibouti", label: "Djibouti" },
                { value: "germany", label: "Germany" },
                { value: "italy", label: "Italy" },
                { value: "japan", label: "Japan" },
                { value: "south_korea", label: "South Korea" },
            ]
        },
        {
            name: "address",
            label: "Address",
            type: "text",
            placeholder: "Address",
            ariaLabel: "address_label",
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