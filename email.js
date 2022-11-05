const nodemailer = require("nodemailer");
const dev = require("../config");

exports.sendEmailWithNodeMailer = async (req, res, emailData) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: dev.app.smtpUsername, // generated ethereal user
        pass: dev.app.smtpPassword, // generated ethereal password
      },
    });

    const mailOptions = {
      from: dev.app.smtpUsername, // sender address
      to: emailData.email, // list of receivers
      subject: emailData.subject, // Subject line
      html: emailData.html, // html body
    };

    // send mail with defined transport object
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: %s", info.response);
      }
    });
  } catch (error) {
    console.log("Problem sending Email: ", error);
  }
};


// registerUserController
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "user already exist with this email",
      });
    }

    //     // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const token = jwt.sign(
      { name, email, hashedPassword, phone },
      String(dev.app.accountActivationKey),
      { expiresIn: "10m" }
    );

    console.log(token);

    const emailData = {
      email,
      subject: "Account Activation Email",
      html: `
      <h2> Hello ${name} . </h2>
      <p> Please click here to  activate your account http://127.0.0.1:3000/auth/activte/${token} </p>
      
      
      `, // html body
    };

    sendEmailWithNodeMailer(req, res, emailData);
  } catch (error) {
    return res.json({
      message: error.message,
    });
  }
};

