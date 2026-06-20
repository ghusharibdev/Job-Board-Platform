const mongoose = require("mongoose");

const jobSchema = mongoose.Schema(
  {
    jobTitle: { type: String, required: true, trim: true },
    jobDescription: { type: String, required: true, trim: true },
    experience: {
      type: String,
      enum: ["entry", "intermediate", "experienced"],
      required: true,
    },
    salary: Number,
    offeredBy: {
      employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employer",
        required: true,
      },
    },
    role: { type: String, trim: true },
  },
  { timestamps: true }
);

const JobListing = new mongoose.model("JobListing", jobSchema);
module.exports = JobListing;
