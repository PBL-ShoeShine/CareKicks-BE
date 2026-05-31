require('dotenv').config();
const nodemailer = require('nodemailer');

// 🟢 1. MESIN GMAIL (ASLI)
const realMailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// 🟡 2. MESIN MAILTRAP (DUMMY/TESTING)
const dummyMailer = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

console.log("✅ Mailer Dual-Mode siap! (Gmail & Mailtrap standby)");

// Mengekspor dua-duanya sekaligus
module.exports = { realMailer, dummyMailer };