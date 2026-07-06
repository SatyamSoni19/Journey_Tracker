import { createHash, randomBytes } from "node:crypto";
export function generateRandomToken() {
    return randomBytes(40).toString("hex");
}
export function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}
