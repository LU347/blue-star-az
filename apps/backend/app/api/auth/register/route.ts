import { NextResponse } from "next/server";
import { Gender, PrismaClient, UserType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Error, Status, UserTypes, Branch} from './enums';

const prisma = new PrismaClient();

function isEnumValue(enumObj: any, value: any): boolean {
    return Object.values(enumObj).includes(value);
}

function validateUserInput(body: any) {
    const requiredFields = ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'gender'];
    for (const field of requiredFields) {
        if (!body[field]) {
            return { error: Error.MISSING_FIELDS, status: 400 };
        }
    }

    if (!isEnumValue(UserTypes, body.userType)) {
        return { error: Error.INVALID_TYPE, status: 400 };
    }

    if (!isEnumValue(Gender, body.gender)) {
        return { error: Error.INVALID_TYPE, status: 400 };
    }

    if (body.userType === UserType.VOLUNTEER && (body.branch || body.addressLineOne || body.addressLineTwo || body.country || body.state )) {
        return NextResponse.json({ error: Error.VALIDATION_ERR}, { status: 400 });
    }

    if (body.userType === UserType.SERVICE_MEMBER) {
        if (!body.branch) {
            return NextResponse.json({ error: Error.MISSING_FIELDS }, { status: 400 });
        }

        if (!isEnumValue(Branch, body.branch)) {
            return NextResponse.json({ error: Error.INVALID_TYPE }, { status: 400 });
        }
    }

    return null;
}

/*
    Handles user registration:
    - Parses the incoming POST request,
    - Validates that all required fields are provided and not empty.
    - Checks if a user with the given email already exists in the database.
    - Hashes the password and creates a new user if validation passes and the user does not already exist.
    - Returns appropriate responses based on success or failure.
*/
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validationError = validateUserInput(body);
        if (validationError) {
            return NextResponse.json({error: Error.INVALID_TYPE });
        }

        const { firstName, lastName, email, password, phoneNumber, userType, gender, addressLineOne, addressLineTwo, branch, country, state } = body;
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: Error.USER_EXISTS }, { status: 400 });
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

        // Only create a ServiceMember if the userType is SERVICE_MEMBER
        if (userType === UserType.SERVICE_MEMBER) {
            const newServiceMember = await prisma.serviceMember.create({
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
        return NextResponse.json({ error: Error.INTERNAL_ERR }, { status: 500 });
    }
}
