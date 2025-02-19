import { NextResponse } from "next/server";
import { Prisma, Gender, PrismaClient, UserType, Branch } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserError, Status, CreateUserRequest } from "app/types/enums";
import { escape as escapeHtml } from "validator";

const EMAIL_REGEX: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX: RegExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const PHONE_NUM_REGEX: RegExp = /^\+?[1-9][0-9]{7,14}$/;

const prismaGlobal = global as typeof global & {
    prisma?: PrismaClient
}

export const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

if (process.env.NODE_ENV !== "production") prismaGlobal.prisma = prisma

function sanitizeInput(input: string): string {
    if (input) {
        return escapeHtml(input.trim());
    }
    return "";
}

function sanitizeBody(body: CreateUserRequest) {
    console.log("body:", body);
    const sanitizedBody = {
        ...body,
        email: sanitizeInput(body.email)?.toLowerCase() || "",
        password: sanitizeInput(body.password),
        firstName: sanitizeInput(body.firstName),
        lastName: sanitizeInput(body.lastName),
        phoneNumber: sanitizeInput(body.phoneNumber),
        gender: body.gender as Gender,
        userType: body.userType as UserType,
        branch: body.branch as Branch,
    };

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

    console.log("sanitized:", sanitizedBody);

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
    return EMAIL_REGEX.test(email);
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
    return PASSWORD_REGEX.test(password);
}

/*
    Number format:
    Basic international phone number validation without delimiters and optional plus sign
    +xxxxxxxxxxx
*/
function isPhoneNumberValid(number: string): boolean {
    return PHONE_NUM_REGEX.test(number);
}

/*
    Validates user input:
    - Checks if any of the required fields are missing
    - Checks if the proper enum values are used
    - Checks if the user is a volunteer and doesn't contain any serviceMember fields
    - Checks if the user is a service member and is missing the required branch value
    - Returns an appropriate response based on success / failure.
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

    if (!isEnumValue(UserType, sanitizedBody.userType) || !isEnumValue(Gender, sanitizedBody.gender)) {
        return {
            error: UserError.INVALID_TYPE,
            message: `Invalid ${!isEnumValue(UserType, sanitizedBody.userType) ? 'user type' : 'gender'}`,
            status: 400
        };
    }

    if (!isEmailValid(sanitizedBody.email)) {
        return { error: UserError.VALIDATION_ERR, message: "Invalid email format", status: 400 };
    }

    if (!isPasswordValid(sanitizedBody.password)) {
        return { error: UserError.VALIDATION_ERR, message: "Invalid password format", status: 400 };
    }

    if (!isPhoneNumberValid(sanitizedBody.phoneNumber)) {
        return { error: UserError.VALIDATION_ERR, message: "Invalid phone number format", status: 400 };
    }

    if (sanitizedBody.userType === UserType.VOLUNTEER) {
        if (sanitizedBody.branch || sanitizedBody.addressLineOne || sanitizedBody.addressLineTwo || sanitizedBody.country || sanitizedBody.state) {
            return { error: UserError.VALIDATION_ERR, message: "Volunteer user should not have service member fields", status: 400 };
        }
    }

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
 * Handles the user registration process.
 *
 * This function processes a POST request for user registration by performing the following steps:
 *
 * - Parses the incoming request's JSON body.
 * - Validates the user input using `validateUserInput`. If validation fails, returns an error response with the appropriate status code.
 * - Checks if a user with the provided email already exists in the database; if so, returns an error response indicating the user exists.
 * - Hashes the provided password with bcrypt.
 * - Creates a new user record in the database using the hashed password and provided user details.
 * - If the user type is `SERVICE_MEMBER`, creates an associated service member record with additional information such as address and branch details.
 * - Catches and logs any errors, returning a generic internal error response.
 *
 * @param req - The incoming Request object containing the user registration details in its JSON body.
 * @returns A JSON response indicating the result of the registration:
 *   - On success: a response with the registration success message and a status code of 201.
 *   - On validation failure, duplicate user, or processing error: a corresponding error message and status code.
 *
 * @example
 * // Example usage in an API route:
 * const response = await POST(request);
 * if (response.status === 201) {
 *   // Registration was successful.
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
            return NextResponse.json({ error: validationError.message || "Validation error" }, { status: validationError.status || 400 });
        }

        const { firstName, lastName, email, password, phoneNumber, userType, gender, addressLineOne, addressLineTwo, branch, country, state, zipCode } = sanitizedBody;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log("User already exists:", existingUser); // Log if user already exists
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
                        ...(zipCode && { zipCode: zipCode })
                    };

                    await prisma.serviceMember.create({
                        data: serviceMemberData,
                    });
                }

                return newUser;
            } catch (error) {
                return NextResponse.json({ error: "Registration failed" }, { status: 500 });
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

