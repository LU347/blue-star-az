import { NextResponse } from "next/server";
import { Gender, PrismaClient, UserType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserError, Status, Branch} from "app/types/enums";

const prisma = new PrismaClient();

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
function isEnumValue(enumObj: any, value: any): boolean {
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
export function validateUserInput(body: any) {
    const requiredFields = ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'gender'];
    for (const field of requiredFields) {
        if (!body[field]) {
            return { error: UserError.MISSING_FIELDS, status: 400 };
        }
    }

    if (!isEnumValue(UserType, body.userType)) {
        return { error: UserError.INVALID_TYPE, status: 400 };
    }

    if (!isEnumValue(Gender, body.gender)) {
        return { error: UserError.INVALID_TYPE, status: 400 };
    }

    if (body.userType === UserType.VOLUNTEER && (body.branch || body.addressLineOne || body.addressLineTwo || body.country || body.state)) {
        return { error: UserError.VALIDATION_ERR, status: 400 };
    }

    if (body.userType === UserType.SERVICE_MEMBER) {
        if (!body.branch) {
            return { error: UserError.MISSING_FIELDS, status: 400 };
        }

        if (!isEnumValue(Branch, body.branch)) {
            return { error: UserError.INVALID_TYPE, status: 400 };
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
        const validationError = validateUserInput(body);
        if (validationError) {
            return NextResponse.json(validationError, { status: validationError.status });
        }

        const { firstName, lastName, email, password, phoneNumber, userType, gender, addressLineOne, addressLineTwo, branch, country, state } = body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: UserError.USER_EXISTS }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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
            await prisma.serviceMember.create({
                data: {
                    userId: newUser.id,
                    addressLineOne,
                    addressLineTwo,
                    branch,
                    country,
                    state,
                },
            });
        }

        return NextResponse.json({ message: Status.REGISTER_SUCCESS }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: UserError.INTERNAL_ERR }, { status: 500 });
    }
}
