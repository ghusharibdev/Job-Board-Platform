const nodemailer = require("nodemailer");
require("dotenv").config();

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAILER_EMAIL || "ghusharibnajam@gmail.com",
      pass: process.env.MAILER_PASSWORD,
    },
  });
};

const notifyEmployer = async (employer, jobApplication) => {
  if (!employer.employerMail || !process.env.MAILER_PASSWORD) return;

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.MAILER_EMAIL || "ghusharibnajam@gmail.com",
    to: employer.employerMail,
    subject: "New Application Received!",
    text: `You have received a new application. Application ID: ${jobApplication._id}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const notifyCandidate = async (candidate, jobApplication) => {
  if (!candidate.candidateMail || !process.env.MAILER_PASSWORD) return;

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.MAILER_EMAIL || "ghusharibnajam@gmail.com",
    to: candidate.candidateMail,
    subject: "Application Status Updated",
    text: `Your job application status has been updated to: ${jobApplication.status}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {
  notifyEmployer,
  notifyCandidate,
};
