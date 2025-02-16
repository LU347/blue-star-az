import { UserType, Gender, Branch } from "@prisma/client";
import { validateUserInput } from "../app/api/auth/register/route";
import { UserError } from "../app/types/enums";

const dummyPassword: string = "passwordTest123!";

describe("validateUserInput", () => {
    it("should return an error if required fields are missing", () => {
        const body = { 
            email: "test@example.com",
            password: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            gender: Gender.FEMALE,
            zipCode: "",
            userType: "" as unknown as UserType
        }; 
        expect(validateUserInput(body)).toEqual({ 
            error: UserError.MISSING_FIELDS, 
            message: `Missing required field: password`,
            status: 400 
        });
    });

    it("should return an error for invalid userType", () => {
        const body = {
            email: "test@example.com",
            password: dummyPassword,
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            gender: Gender.MALE,
            userType: "TEST" as unknown as UserType,
        };
        expect(validateUserInput(body)).toEqual({ 
            error: UserError.INVALID_TYPE, 
            message: "Invalid user type",
            status: 400 });
    });

    it("should return an error if gender is invalid", () => {
        const body = {
            email: "test@example.com",
            password: dummyPassword,
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            gender: "TEST" as unknown as Gender,
            userType: UserType.VOLUNTEER,
        };
        expect(validateUserInput(body)).toEqual({ 
            error: UserError.INVALID_TYPE, 
            message: "Invalid gender",
            status: 400 });
    });

    it("should return an error if volunteer provides serviceMember fields", () => {
        const body = {
            email: "test@example.com",
            password: dummyPassword,
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            gender: Gender.MALE,
            userType: UserType.VOLUNTEER,
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
            gender: Gender.MALE,
            userType: UserType.SERVICE_MEMBER,
            branch: null as unknown as Branch,
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
            userType: UserType.VOLUNTEER,
        };
        expect(validateUserInput(body)).toBeNull();
    });
});
