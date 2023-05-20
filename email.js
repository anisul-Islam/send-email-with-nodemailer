// helpers/email.js
  const dev = require('../config');
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: dev.app.smtpUsername, // generated ethereal user
        pass: dev.app.smtpPassword, // generated ethereal password
      },
    });

    exports.sendEmailWithNodeMailer = async (emailData) => {
      try {
        const mailOptions = {
          from: dev.app.smtpUsername, // sender address
          to: emailData.email, // list of receivers
          subject: emailData.subject, // Subject line
          html: emailData.html, // html body
        };

        // send mail with defined transport object
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.response);
      } catch (error) {
        console.log('Error occurred while sending Email: ', error);
        throw error; // Propagate the error up to the caller
      }
    };


// controllers/auth.js
// api/register
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

    sendEmailWithNodeMailer(emailData);
  } catch (error) {
    return res.json({
      message: error.message,
    });
  }
};

// controllers/auth.js
// api/activate-account
const accountActivation = async (req, res) => {
  console.log("account activate");
  try {
    const { token } = req.body;
    if (token) {
      jwt.verify(
        token,
        String(dev.app.accountActivationKey),
        async (err, decoded) => {
          if (err) {
            console.log("JWT Verification error", err);
            return res.status(401).json({
              error: "Expired Link. signup again",
            });
          }

          const { name, email, hashedPassword, phone } = jwt.decode(token);

          const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            isVerify: 1,
          });

          console.log(newUser);

          // double guard
          const existingUser = await User.findOne({ email });

          if (existingUser) {
            return res.status(400).json({
              message: "user already exist with this email",
            });
          }

          const userData = await newUser.save();
          if (!userData) {
            return res.status(400).send({
              message: "user was not created",
            });
          }

          return res.status(200).send({
            message: "user was created successfully ! Please signin",
          });
        }
      );
    }
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
};

