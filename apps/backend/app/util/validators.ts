import validator from "validator";

export function isBodyValid(body: unknown): body is Record<string, any> {
    return typeof body === 'object' && body !== null && !Array.isArray(body);
}

//checks if id is an int
export function isIDValid(id: string | number) {
    if (!id || typeof id == 'string') {
        return { error: 'Invalid ID provided' }
    }
    return null;
}

//checks if string only consists of alphabetical characters and spaces
export function isStringValid(str: string) {
    if (!str || !validator.matches(str, /^[ A-Za-z]+$/)) {
        return { error: 'Invalid name or description provided' }
    }
    return null;
}

//checks if an obj is empty, in this case, it checks if the query returned any rows of data
export function isEmpty(obj: unknown): boolean {
    if (!obj || Object.keys(obj).length === 0) {
        return true
    }
    return false
}

export function isEmailValid(email: string): boolean {
    return validator.isEmail(email);
}

/*
    Password format:
    - Must have minimum 8 characters
    - At least one uppercase English letter (A-Z)
    - At least one lowercase English letter (a-z)
    - At least one digit (0-9)
    - At least one special character (#?!@$%^&*-)
*/
export function isPasswordValid(password: string): boolean {
    return validator.isStrongPassword(password);
}

/*
    Number format:
    Basic international phone number validation without delimiters and optional plus sign
    + xxxxxxxxxxx or xxxxxxxxxx
*/
export function isPhoneNumberValid(number: string): boolean {
    return validator.isMobilePhone(number);
}

export function isEnumValue<T extends Record<string, string>>(enumObj: T, value: string): value is T[keyof T] {
    return Object.values(enumObj).includes(value as T[keyof T]);
}