import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import validator, { escape as escapeHtml } from "validator";

import { Prisma, Gender, PrismaClient, UserType, Branch } from "@prisma/client";

import { UserError, Status, CreateUserRequest } from "app/types/enums";

// Extend the global object to include an optional Prisma client instance
const prismaGlobal = global as typeof global & {
    prisma?: PrismaClient
}

/**
 * Initializes the Prisma Client.
 * - Reuses an existing Prisma instance if available (to prevent multiple connections in development).
 * - Creates a new Prisma Client instance if none exists.
 * - Enables query logging in development mode.
 */
export const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

// Store the Prisma instance globally in development to prevent multiple instances due to hot-reloading.
if (process.env.NODE_ENV !== "production") prismaGlobal.prisma = prisma

// This should remove nonalphanumeric characters and remove extra whitespace.
function sanitizeInput(input: string): string {
    if (input) {
        return escapeHtml(input.trim());
    }
    return "";
}

/**
 * Sanitizes and normalizes a CreateUserRequest object.
 *
 * This function cleans string-based fields to mitigate security risks such as XSS by trimming whitespace
 * and escaping HTML characters. It converts the email to lowercase, sanitizes the password, first name,
 * last name, and phone number, and processes optional address and location fields (addressLineOne,
 * addressLineTwo, country, state, and city) only if they exist. Enum fields (gender, userType, branch)
 * are also cast to their respective types.
 *
 * @param body - The raw user registration input.
 * @returns A sanitized version of the user registration input.
 */
function sanitizeBody(body: CreateUserRequest) {
    const sanitizedBody = {
        ...body,
        email: sanitizeInput(body.email)?.toLowerCase() || "",
        password: sanitizeInput(body.password),
        firstName: sanitizeInput(body.firstName),
        lastName: sanitizeInput(body.lastName),
        phoneNumber: sanitizeInput(body.phoneNumber),
        gender: sanitizeInput(body.gender) as Gender,
        userType: sanitizeInput(body.userType) as UserType,
        branch: sanitizeInput(body.branch) as Branch,
    };

    /*
        Currently, I am manually checking each optional field for presence and sanitizing it. 
        I attempted to refactor this by iterating through a list of optional fields but encountered a 
        "type string is not assignable to type never" error, which I could not resolve in time.
    
        For now, I'm leaving the implementation as it is, but I plan to refactor this to use an 
        array of optional fields for better scalability and maintainability once I have more time to 
        address the type issues.

        I believe the root cause of this issue lies in how I'm defining my interface (CreateUserRequest). 
        I think I need to separate the optional and required fields into two distinct interfaces and then 
        create another interface that merges them. This should help clarify the structure and resolve the 
        typing issues I'm encountering.
    */
    if (body.addressLineOne) {
        sanitizedBody.addressLineOne = sanitizeInput(body.addressLineOne) || "";
    }
    if (body.addressLineTwo) {
        sanitizedBody.addressLineTwo = sanitizeInput(body.addressLineTwo) || "";
    }
    if (body.country) {
        sanitizedBody.country = sanitizeInput(body.country) || "";
    }
    if (body.state) {
        sanitizedBody.state = sanitizeInput(body.state) || "";
    }
    if (body.city) {
        sanitizedBody.city = sanitizeInput(body.city) || "";
    }

    return sanitizedBody;
}

/**
 * Determines if a specified value exists within the provided enum object's values.
 *
 * This function checks if the given value is one of the valid values defined in the enum
 * by converting the enum object to an array of its values and verifying if the value is included.
 *
 * @param enumObj - The enumeration object to inspect.
 * @param value - The value to verify as a member of the enum.
 * @returns True if the value exists in the enum, otherwise false.
 *
 * @example
 * enum UserRole {
 *   ADMIN = "ADMIN",
 *   GUEST = "GUEST"
 * }
 *
 * const isValid = isEnumValue(UserRole, "ADMIN"); // returns true
 */
function isEnumValue<T extends { [key: string]: string | number }>(enumObj: T, value: T[keyof T]): boolean {
    return Object.values(enumObj).includes(value);
}

/**
 * Validates user registration input.
 *
 * This function checks that the provided input object includes all required registration fields
 * (email, password, firstName, lastName, phoneNumber, and gender) and validates that the `userType`
 * and `gender` fields match their respective enum values. For volunteer users, it ensures that no
 * service member-specific fields (branch, addressLineOne, addressLineTwo, country, or state) are present.
 * For service members, it verifies that the `branch` field is provided and contains a valid enum value.
 *
 * @param body - The input object containing user registration details.
 * @returns Null if the validation passes; otherwise, an object with an `error` property indicating the type of error
 *          (e.g., missing fields or invalid type) along with an HTTP status code (typically 400).
 */
function isEmailValid(email: string): boolean {
    return validator.isEmail(email);
}

/*
    Password format:
    - Must have minimum 8 characters
    - At least one uppercase English letter (A-Z)
    - At least one lowercase English letter (a-z)
    - At least one digit (0-9)
    - At least one special character (#?!@$%^&*-)
*/
function isPasswordValid(password: string): boolean {
    return validator.isStrongPassword(password);
}

/*
    Number format:
    Basic international phone number validation without delimiters and optional plus sign
    + xxxxxxxxxxx or xxxxxxxxxx
*/
function isPhoneNumberValid(number: string): boolean {
    return validator.isMobilePhone(number);
}

/**
 * Validates a sanitized user registration request.
 *
 * This function checks that all required fields are present and properly formatted. It verifies that:
 * - Mandatory fields (email, password, firstName, lastName, phoneNumber, gender) are provided.
 * - First and last names contain only alphabetical characters, spaces, apostrophes, or hyphens.
 * - The provided values for user type and gender match the expected enum values.
 * - Email, password, and phone number formats are valid.
 * - For volunteer users, no service member-specific fields (branch, addressLineOne, addressLineTwo, country, state) are present.
 * - For service members, a valid branch is provided.
 *
 * @param sanitizedBody - The sanitized input data for user registration.
 * @returns An error object with details ({ error, message, status }) if any validation fails, or null if the input is valid.
 */
export function validateUserInput(sanitizedBody: CreateUserRequest) {
    const requiredFields: (keyof CreateUserRequest)[] = ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'gender'];
    for (const field of requiredFields) {
        if (!sanitizedBody[field]) {
            return {
                error: UserError.MISSING_FIELDS,
                message: `Missing required field: ${field}`,
                status: 400
            };
        }
    }

    // Validate first and last names
    if (!validator.matches(sanitizedBody.firstName, /^[A-Za-z' -]+(?: [A-Za-z' -]+)*$/) ||
        !validator.matches(sanitizedBody.lastName, /^[A-Za-z' -]+(?: [A-Za-z' -]+)*$/)) {
        return { error: UserError.VALIDATION_ERR, message: "Name contains non-alphabetical characters", status: 400 }
    }

    // Validate enum values
    if (!isEnumValue(UserType, sanitizedBody.userType) || !isEnumValue(Gender, sanitizedBody.gender)) {
        return {
            error: UserError.INVALID_TYPE,
            message: `Invalid ${!isEnumValue(UserType, sanitizedBody.userType) ? 'user type' : 'gender'}`,
            status: 400
        };
    }

    // Validate email format
    if (!isEmailValid(sanitizedBody.email)) {
        return { error: UserError.VALIDATION_ERR, message: "Invalid email format", status: 400 };
    }

    // Validate password strength
    if (!isPasswordValid(sanitizedBody.password)) {
        return { error: UserError.VALIDATION_ERR, message: "Invalid password format", status: 400 };
    }

    // Validate phone number format
    if (!isPhoneNumberValid(sanitizedBody.phoneNumber)) {
        return { error: UserError.VALIDATION_ERR, message: "Invalid phone number format", status: 400 };
    }

    // Ensures that the volunteer account does not contain any fields/values associated with a service member account.
    if (sanitizedBody.userType === UserType.VOLUNTEER) {
        if (sanitizedBody.branch || sanitizedBody.addressLineOne || sanitizedBody.addressLineTwo || sanitizedBody.country || sanitizedBody.state) {
            return { error: UserError.VALIDATION_ERR, message: "Volunteer user should not have service member fields", status: 400 };
        }
    }

    // Ensures that a service member accounst has the required branch field and a valid branch value
    if (sanitizedBody.userType === UserType.SERVICE_MEMBER) {
        if (!sanitizedBody.branch) {
            return { error: UserError.MISSING_FIELDS, message: "Missing branch for service member", status: 400 };
        }

        if (!isEnumValue(Branch, sanitizedBody.branch)) {
            return { error: UserError.INVALID_TYPE, message: "Invalid branch type", status: 400 };
        }
    }

    return null; // Validation passes
}

/**
 * Processes a POST request to register a new user.
 *
 * This function handles user registration by performing the following operations:
 * - Parses the JSON body of the incoming request.
 * - Sanitizes and validates the user input. If validation fails, returns a JSON error response.
 * - Checks whether a user with the provided email already exists, returning an error if one is found.
 * - Hashes the user's password using bcrypt.
 * - Creates a new user record in the database.
 * - If the user is a service member, creates an associated record with additional details—such as address lines, branch, country, state, zip code, and city if provided.
 * - Catches errors from database operations (e.g., duplicate email) and general exceptions, returning appropriate JSON responses.
 *
 * @param req - The incoming request containing registration details in its JSON body.
 * @returns A JSON response indicating either successful registration with a 201 status code or an error message with the corresponding status code.
 *
 * @example
 * const response = await POST(request);
 * if (response.status === 201) {
 *   // Registration succeeded.
 * } else {
 *   // Handle registration error.
 * }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const sanitizedBody = sanitizeBody(body);

        const validationError = validateUserInput(sanitizedBody);
        if (validationError) {
            return NextResponse.json({ error: validationError.message }, { status: validationError.status || 400 });
        }

        const { firstName, lastName, email, password, phoneNumber, userType, gender, addressLineOne, addressLineTwo, branch, country, state, zipCode, city } = sanitizedBody;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: UserError.USER_EXISTS }, { status: 400 });
        }

        const HASH_ROUNDS = process.env.HASH_ROUNDS ? parseInt(process.env.HASH_ROUNDS) : 12;
        const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);

        const result = await prisma.$transaction(async (prisma) => {
            try {
                const newUser = await prisma.user.create({
                    data: {
                        firstName,
                        lastName,
                        email,
                        password: hashedPassword,
                        phoneNumber,
                        userType,
                        gender
                    },
                });

                if (userType === UserType.SERVICE_MEMBER) {
                    const serviceMemberData: any = {
                        userId: newUser.id,
                        ...(addressLineOne && { addressLineOne: addressLineOne }),
                        ...(addressLineTwo && { addressLineTwo: addressLineTwo }),
                        ...(branch && { branch: branch }),
                        ...(country && { country: country }),
                        ...(state && { state: state }),
                        ...(zipCode && { zipCode: zipCode }),
                        ...(city && { city: city })
                    };

                    await prisma.serviceMember.create({
                        data: serviceMemberData,
                    });
                }

                return newUser;
            } catch (error) {
                throw error;
            }
        });

        return NextResponse.json(
            { status: 'success', message: Status.REGISTER_SUCCESS },
            { status: 201 }
        );

    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json({ error: "Email already exists" }, { status: 409 });
            }
            return NextResponse.json({ error: "Database operation failed", message: error.message }, { status: 500 });
        }
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}

