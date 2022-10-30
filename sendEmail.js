const nodemailer = require('nodemailer');
const dev = require('../config');

const emailSetUp = async (optionSetup) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: dev.app.smtpUsername, // generated ethereal user
        pass: dev.app.smtpPassword, // generated ethereal password
      },
    });

    const mailOptions = {
      from: dev.app.smtpUsername, // sender address
      to: optionSetup.email, // list of receivers
      subject: optionSetup.subject, // Subject line
      html: optionSetup.html, // html body
    };

    // send mail with defined transport object
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Message sent: %s', info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

exports.sendVerificationEmail = async (name, email, _id) => {
  const optionSetup = {
    email,
    subject: 'verification Email',
    html: `<p>Hello ${name} . Please click here to verify: <a href="http://127.0.0.1:3001/api/verify?id=${_id}"> Verify Email </a> Your Mail</p>`, // html body
  };
  emailSetUp(optionSetup);
};

exports.sendResetPasswordEmail = async (name, email, passwordResetToken) => {
  const optionSetup = {
    email,
    subject: 'Password Reset Email',
    html: `<p>Hello ${name} . Please click here to  <a href="http://127.0.0.1:3001/api/reset-password?token=${passwordResetToken}">reset password </a> </p>`, // html body
  };
  emailSetUp(optionSetup);
};
