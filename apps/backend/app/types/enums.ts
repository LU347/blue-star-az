import { UserType, Branch, Gender} from "@prisma/client";

export enum UserError {
    INVALID_METHOD = "Invalid method",
    MISSING_FIELDS = "Missing fields",
    USER_EXISTS = "Registration failed",
    USER_NONEXISTENT = "User does not exist",
    INTERNAL_ERR = "Internal server error",
    INVALID_CREDENTIALS = "Invalid credentials",
    INVALID_TOKEN = "Invalid token",
    INVALID_TYPE = "Invalid type",
    VALIDATION_ERR = "Validation error",
    UNAUTHORIZED = "Unauthorized action",
    UNDEFINED = " is undefined",
    TOKEN_EXPIRED = "Session expired",
    DATABASE_ERROR = "DB Error",
}

export enum Status {
    REGISTER_SUCCESS = "User registered successfully!",
    LOGIN_SUCCESS = "User logged in successfully!",
    LOGOUT_SUCCESS = "User logged out successfully!"
}

export interface ServiceMember {
    userId: number;
    addressLineOne: string;
    addressLineTwo?: string;
    branch: Branch;
    country?: string;
    state?: string;
    zipCode?: string;
}

export interface CreateUserRequest {
    zipCode?: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    userType: UserType;
    gender: Gender;
    branch?: Branch;
    addressLineOne?: string | undefined;
    addressLineTwo?: string | undefined;
    country?: string | undefined;
    state?: string | undefined;             //forgot zip code Q-Q
}