export type UserType = "VOLUNTEER" | "SERVICE_MEMBER"; 
export type Gender = "MALE" | "FEMALE";
export type Branch = "ARMY" | "NAVY" | "AIR_FORCE" | "SPACE_FORCE" | "COAST_GUARD" | "NATIONAL_GUARD" | "MARINES";

export interface UserFields {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: string;
    userType: string;
}

export interface ServiceMemberFields {
    branch: string;
    addressLineOne?: string | null;
    addressLineTwo?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    zipCode?: string | null;
}

export type RegisterUserRequest = 
    | (UserFields & { userType: "VOLUNTEER" })
    | (UserFields & ServiceMemberFields & { userType: "SERVICE_MEMBER" });
