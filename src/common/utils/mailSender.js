import nodemailer from 'nodemailer';
import createError from './error.js';
import { EMAIL_PASSWORD } from '../configs/environments.js';

const sendEmail = async (email, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "doanduong161@gmail.com",
            pass: EMAIL_PASSWORD,
        }
    });
    const mailOptions = {
        from: 'Duong Admin',
        to: email,
        subject: subject,
        text: text,
    };
    try{
        await transporter.sendMail(mailOptions);
    }catch (error){
        throw createError(500, "Failed to send email", error);
    }
}

export default sendEmail;