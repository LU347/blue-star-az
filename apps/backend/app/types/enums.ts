export enum UserError {
    INVALID_METHOD = "Invalid method",
    MISSING_FIELDS = "Missing fields",
    USER_EXISTS = "User already exists",
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

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE"
}

export enum Branch {
    ARMY = "ARMY",
    NAVY = "NAVY",
    AIR_FORCE = "AIR_FORCE",
    SPACE_FORCE = "SPACE_FORCE",
    COAST_GUARD = "COAST_GUARD",
    NATIONAL_GUARD = "NATIONAL_GUARD",
    MARINES = "MARINES",
}

export interface ServiceMember {
    userId: number;
    addressLineOne: string;
    addressLineTwo?: string;
    branch: Branch;
    country?: string;
    state?: string
}