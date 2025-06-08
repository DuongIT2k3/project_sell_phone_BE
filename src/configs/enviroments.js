import dotenv from "dotenv"

dotenv.config({
    path: ".env",
    debug: true,
    encoding: "utf8",
    silent: true,
    defaults: true,
    ignoreProcessEnv: true,
    expand: true,
    assignToProcessEnv: true,
    overrideProcessEnv: true,
    
})

export const { DB_URI, HOST, PORT } = process.env