const nodemailer = require("nodemailer");

async function sendMail(to, subject, text) {
    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Replace with your SMTP server
        port: 587, // Replace with your SMTP port
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'arnabbhowmik019@gmail.com', // Replace with your email
            pass: 'emafbqxwheedtqbj' // Replace with your email password amuunpqclrzpnaqq
        }
    });

    // Setup email data
    let mailOptions = {
        from: 'arnabbhowmik019@gmail.com', // Replace with your sender email
        to: to, 
        subject: subject, // Subject line
        text: text // Plain text body
    };

    let info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

// Example usage
module.exports = sendMail;