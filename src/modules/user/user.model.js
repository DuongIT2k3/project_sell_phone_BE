import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    phoneNumber: {
        type: String,
    },    
    password: {
        type: String,
        required: true,
    },
    isVerifyEmail: {
        type: Boolean,
        default: false,
    },
    isVerifyPhone: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: "member",
        enum: ["member", "admin", "superAdmin"],
    },
    address: {
        type: String,
        default: "",
    },
    bios: {
        type: String,
        default: "",
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dz3qj1x8h/image/upload/v1698851234/avatar/avatar-default.png",
    },
    isActive: {
        type: Boolean,    
        default: true,
    },
    social: {
        facebook: {
            type: String,
            default: "",
        },
        instagram: {
            type: String,
            default: "",
        },
        tiktok: {
            type: String,
            default: "",
        },
    },

},
{
    versionKey: false,
    timestamps: true,
}
)
export default mongoose.model("User", userSchema);