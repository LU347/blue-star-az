import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, Gender, PrismaClient, UserType, Branch } from "@prisma/client";

import { UserError, Status } from "app/types/enums";
import { UserFields, ServiceMemberFields, RegisterUserRequest } from "app/types/interfaces";

import { isEmailValid, isEnumValue, isPasswordValid, isPhoneNumberValid, isStringValid } from "app/util/validators";
import { sanitizeBody } from "app/util/sanitizers";

import { sendEmail } from "../../../service/emailService";

const prismaGlobal = global as typeof global & {
    prisma?: PrismaClient
}

const prisma = prismaGlobal.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
});

if (process.env.NODE_ENV !== "production") prismaGlobal.prisma = prisma

function validateUserInput(sanitizedBody: RegisterUserRequest) {
    const requiredFields: (keyof RegisterUserRequest)[] = ['email', 'password', 'firstName', 'lastName', 'phoneNumber', 'gender'];
    for (const field of requiredFields) {
        if (!sanitizedBody[field]) {
            return {
                error: UserError.MISSING_FIELDS,
                message: `Missing required field: ${field}`,
                status: 400
            };
        }
    }

    if (!isStringValid(sanitizedBody.firstName) || !isStringValid(sanitizedBody.lastName)) {
        return { error: UserError.VALIDATION_ERR, message: "Name contains non-alphabetical characters", status: 400 }
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

    // Ensures that the volunteer account does not contain any fields/values associated with a service member account.
    if (sanitizedBody.userType === "VOLUNTEER") {
        const serviceMemberFields: (keyof ServiceMemberFields)[] = ["addressLineOne", "addressLineTwo", "country", "state", "city", "zipCode"];
        const hasServiceMemberFields = serviceMemberFields.some(field =>
            (sanitizedBody as Partial<ServiceMemberFields>)[field] !== undefined);

        if (hasServiceMemberFields) {
            return {
                error: UserError.VALIDATION_ERR,
                message: "Volunteer user should not have service member fields",
                status: 400,
            };
        }
    }

    // Ensures that a service member accounst has the required branch field and a valid branch value
    if (sanitizedBody.userType === "SERVICE_MEMBER") {
        if (!sanitizedBody.branch) {
            return { error: UserError.MISSING_FIELDS, message: "Missing branch for service member", status: 400 };
        }

        if (!isEnumValue(Branch, sanitizedBody.branch)) {
            return { error: UserError.INVALID_TYPE, message: "Invalid branch type", status: 400 };
        }
    }

    return null;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const sanitizedBody = sanitizeBody(body) as unknown as RegisterUserRequest;

        const validationError = validateUserInput(sanitizedBody);
        if (validationError) {
            return NextResponse.json({ error: validationError.message }, { status: validationError.status || 400 });
        }

        const { firstName, lastName, email, password, phoneNumber, userType, gender,
            addressLineOne, addressLineTwo, branch, country, state, zipCode, city
        } = sanitizedBody as UserFields & ServiceMemberFields;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: UserError.USER_EXISTS }, { status: 400 });
        }

        const HASH_ROUNDS = process.env.HASH_ROUNDS ? parseInt(process.env.HASH_ROUNDS) : 12;
        const hashedPassword = await bcrypt.hash(password, HASH_ROUNDS);

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const newUser = await tx.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    phoneNumber,
                    userType: userType as UserType,
                    gender: gender as Gender
                },
            });

            if (userType === UserType.SERVICE_MEMBER) {
                const serviceMemberData: Prisma.ServiceMemberCreateInput = {
                    User: { connect: { id: newUser.id } }, // Correctly using the User relation to connect by ID
                    addressLineOne: addressLineOne || null,
                    addressLineTwo: addressLineTwo || null,
                    branch: branch as Branch, // Ensure branch is valid
                    country: country || null,
                    state: state || null,
                    zipCode: zipCode || null,
                    city: city || null,
                    updated_at: new Date()
                };
              
                await tx.serviceMember.create({
                  data: serviceMemberData,
                });
              }
        });

        return NextResponse.json(
            { status: 'success', message: Status.REGISTER_SUCCESS },
            { status: 201 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}

