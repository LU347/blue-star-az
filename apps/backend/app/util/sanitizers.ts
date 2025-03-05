import { escape as escapeHTML } from "validator";
import { isBodyValid } from "./validators";

export function sanitizeBody(body: unknown): Record<string, string | number | boolean> {
    if (!isBodyValid(body)) { 
        return { error: 'Invalid or missing body', status: 400 } as Record<string, string | number>;
    }

    const sanitizedBody: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
        sanitizedBody[key] = sanitizeField(value);
    }

    return sanitizedBody;
}

export function sanitizeField(value: unknown): string | number | boolean {
    if (typeof value === "string") {
        return escapeHTML(value);
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return value;
    }
    return "";
}
