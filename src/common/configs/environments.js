import dotenv from "dotenv"

dotenv.config({
    path: ".env",
    debug: true,
    encoding: "utf8",
    override: true,
})

export const { DB_URI, HOST, PORT, JWT_SECRET_KEY, JWT_EXPIRES_IN, JWT_SECRET_KEY_FOR_EMAIL, JWT_EXPIRES_IN_FOR_EMAIL, EMAIL_PASSWORD } = process.env