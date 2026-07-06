import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
export function validate(schema) {
    return (req, res, next) => {
        try {
            const parsed = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = parsed.body ?? req.body;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                }));
                next(ApiError.badRequest("Validation failed", formattedErrors));
                return;
            }
            next(error);
        }
    };
}
