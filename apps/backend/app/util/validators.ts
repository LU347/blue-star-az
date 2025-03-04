import validator from "validator";

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