import { UserType, Branch, Gender} from "@prisma/client";

export enum UserError {
    INVALID_METHOD = "Invalid method",
    MISSING_FIELDS = "Missing fields",
    USER_EXISTS = "Account already exists",
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
