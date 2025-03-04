import { escape as escapeHTML } from "validator";
import { isBodyValid } from "./validators";

export function sanitizeBody(body: unknown): Record<string, any> {
    if (!isBodyValid(body)) { 
        return { error: 'Invalid or missing body', status: 400 }
    }

    const sanitizedBody: Record<string, any> = {}

    for (const [key, value] of Object.entries(body)) {
        sanitizedBody[key] = sanitizeField(value);
    }

    return sanitizedBody
}

export function sanitizeField(value: string): string {
    return escapeHTML(value);
}