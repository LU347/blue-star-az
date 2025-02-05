export enum Error {
    INVALID_METHOD = "Invalid method",
    MISSING_FIELDS = "Missing fields",
    USER_EXISTS = "User already exists",
    INTERNAL_ERR = "Internal server error",
    INVALID_TYPE = "Invalid type",
    VALIDATION_ERR = "Validation error"
}

export enum Status {
    REGISTER_SUCCESS = "User registered successfully!",
}

export enum UserTypes {
    SERVICE_MEMBER = "SERVICE_MEMBER",
    VOLUNTEER = "VOLUNTEER",
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