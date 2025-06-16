import dotenv from "dotenv"

dotenv.config({
    path: ".env",
    debug: true,
    encoding: "utf8",
    override: true,
})

export const { DB_URI, HOST, PORT } = process.env