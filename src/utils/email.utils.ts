import nodemailer from 'nodemailer';
export const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
export const sendOTPEmail = async (email: string, otp: number) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Tutor Appointy" <${process.env.z_USER}>`,
    to: email,
    subject: 'Email Verification OTP',
    text: `Your Tutor Appointy verification OTP is ${otp}. It is valid for 10 minutes.`,
  });
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verify your email',
    html: `<h3>Welcome!</h3>
           <p>Please click the link below to verify your email:</p>
           <a href="${verificationUrl}">${verificationUrl}</a>`,
  };

  await transporter.sendMail(mailOptions);
};
