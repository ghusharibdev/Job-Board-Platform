const mongoose = require("mongoose");

const employerSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employerName: { type: String, required: true, trim: true },
    employerContact: Number,
    employerMail: { type: String, trim: true },
    companyName: String,
    companyAddress: String,
    jobsListed: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "JobListing",
        },
      },
    ],
    applications: [
      {
        applicationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Application",
        },
      },
    ],
  },
  { timestamps: true }
);

const Employer = new mongoose.model("Employer", employerSchema);
module.exports = Employer;
