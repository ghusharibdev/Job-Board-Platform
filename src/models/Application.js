const mongoose = require("mongoose");

const applicationSchema = mongoose.Schema(
  {
    from: {
      candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
      },
    },
    to: {
      employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employer",
        required: true,
      },
    },
    forJob: {
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobListing",
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

applicationSchema.index(
  { "from.candidateId": 1, "forJob.jobId": 1 },
  { unique: true }
);

const Application = new mongoose.model("Application", applicationSchema);
module.exports = Application;
