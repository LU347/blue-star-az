
export interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    userType: string;
    gender: string;
    branch: string;
    addressLineOne?: string;
    addressLineTwo?: string;
    city?: string;
    country?: string;
    state?: string;     
    zipCode?: string;        
}

export interface LoginUserRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    message: string; 
    data: {
        token: string
    };
}