const mongoose = require("mongoose");

const candidateSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidateName: { type: String, required: true, trim: true },
    candidateContact: Number,
    candidateMail: { type: String, trim: true },
    description: String,
    resumeLink: String,
    skills: [String],
    workHistory: [
      {
        company: String,
        title: String,
        from: Date,
        to: Date,
      },
    ],
  },
  { timestamps: true }
);

const Candidate = new mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
