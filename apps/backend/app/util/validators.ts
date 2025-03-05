import validator from "validator";

export function isBodyValid(body: unknown): body is Record<string, string | number | boolean | null> {
    return typeof body === 'object' && body !== null && !Array.isArray(body);
}

// Checks if ID is an integer
export function isIDValid(id: string | number): { error: string } | null {
    if (!id || (typeof id === 'string' && !validator.isInt(id))) {
        return { error: 'Invalid ID provided' };
    }
    return null;
}

// Checks if string only consists of alphabetical characters and spaces
export function isStringValid(str: string): boolean {
    return !!str && validator.matches(str, /^[ A-Za-z]+$/);
}

// Checks if an object is empty (useful for checking if a query returned any rows of data)
export function isEmpty(obj: unknown): boolean {
    return typeof obj !== 'object' || obj === null || Object.keys(obj).length === 0;
}

// Validates email format
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

// Validates if a value exists within a given enum
export function isEnumValue<T extends Record<string, string>>(enumObj: T, value: string): value is T[keyof T] {
    return Object.values(enumObj).includes(value as T[keyof T]);
}
