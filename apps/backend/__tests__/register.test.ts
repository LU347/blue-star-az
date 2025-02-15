import { validateUserInput } from "../app/api/auth/register/route";
import { UserError, Gender, Branch } from "../app/types/enums";

const dummyPassword: string = "passwordTest123!";

describe("validateUserInput", () => {
    it("should return an error if required fields are missing", () => {
        const body = { email: "test@example.com" }; // Missing required fields
        expect(validateUserInput(body)).toEqual({ error: UserError.MISSING_FIELDS, status: 400 });
    });

    it("should return an error for invalid userType", () => {
        const body = {
            email: "test@example.com",
            password: dummyPassword,
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            gender: Gender.MALE,
            userType: "INVALID_TYPE",
        };
        expect(validateUserInput(body)).toEqual({ error: UserError.INVALID_TYPE, status: 400 });
    });

    it("should return an error if gender is invalid", () => {
        const body = {
            email: "test@example.com",
            password: dummyPassword,
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            gender: "INVALID_GENDER",
            userType: "VOLUNTEER",
        };
        expect(validateUserInput(body)).toEqual({ error: UserError.INVALID_TYPE, status: 400 });
    });

    it("should return an error if volunteer provides serviceMember fields", () => {
        const body = {
            email: "test@example.com",
            password: dummyPassword,
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            gender: Gender.MALE,
            userType: "VOLUNTEER",
            branch: Branch.ARMY, // Should not be provided by a volunteer,
        };
        expect(validateUserInput(body)).toEqual({ error: UserError.VALIDATION_ERR, status: 400 });
    });

    it("should return an error if service member is missing branch", () => {
        const body = {
            email: "test@example.com",
            password: dummyPassword,
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            gender: "MALE",
            userType: "SERVICE_MEMBER",
            branch: null,
        };
        expect(validateUserInput(body)).toEqual({ error: UserError.MISSING_FIELDS, status: 400 });
    });

    it("should return null for valid input", () => {
        const body = {
            email: "test@example.com",
            password: dummyPassword,
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            gender: Gender.MALE,
            userType: "VOLUNTEER",
        };
        expect(validateUserInput(body)).toBeNull();
    });
});
