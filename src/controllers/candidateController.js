const { notifyEmployer } = require("../middlewares/notify");
const Application = require("../models/Application");
const Candidate = require("../models/Candidate");
const Employer = require("../models/Employer");
const JobListing = require("../models/JobListing");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

fs.mkdirSync("uploads/resumes", { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/resumes/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "resume-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const searchJob = async (req, res) => {
  try {
    const { search, experience, salary } = req.body;

    if (req.user.userType !== "Candidate") {
      return res.status(403).json({ message: "Login as candidate to search for job!" });
    }

    const jobs = await JobListing.find({
      ...(search
        ? {
            $or: [
              { jobTitle: { $regex: search, $options: "i" } },
              { jobDescription: { $regex: search, $options: "i" } },
              { role: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
      ...(experience ? { experience } : {}),
      ...(salary ? { salary: { $gte: Number(salary) } } : {}),
    }).populate("offeredBy.employerId");

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: "No job found!" });
    }

    res.json(jobs);
  } catch (error) {
    console.error("Error searching jobs:", error);
    res.status(500).json({ message: "Error searching jobs!" });
  }
};

const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (req.user.userType !== "Candidate") {
      return res.status(403).json({ message: "Login as candidate to apply for job!" });
    }

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required!" });
    }

    const candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate profile not found!" });
    }

    const job = await JobListing.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found!" });
    }

    const employer = await Employer.findById(job.offeredBy.employerId);
    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found!" });
    }

    const alreadyApplied = await Application.findOne({
      "from.candidateId": candidate._id,
      "forJob.jobId": jobId,
    });

    if (alreadyApplied) {
      return res.status(409).json({ message: "You have already applied for this job!" });
    }

    const newApplication = await Application.create({
      from: { candidateId: candidate._id },
      to: { employerId: employer._id },
      forJob: { jobId },
    });

    await Employer.findByIdAndUpdate(employer._id, {
      $addToSet: { applications: { applicationId: newApplication._id } },
    });

    notifyEmployer(employer, newApplication);

    res.status(201).json({ message: "Applied for job!", application: newApplication });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Couldn't apply!" });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (req.user.userType !== "Candidate") {
      return res.status(403).json({ message: "Only candidates can upload resumes!" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate profile not found!" });
    }

    candidate.resumeLink = req.file.path;
    await candidate.save();

    res.json({
      message: "Resume uploaded successfully!",
      resumePath: req.file.path,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    res.status(500).json({ message: "Error uploading resume!" });
  }
};

const getResume = async (req, res) => {
  try {
    if (req.user.userType !== "Candidate") {
      return res.status(403).json({ message: "Only candidates can access their resume!" });
    }

    const candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate profile not found!" });
    }

    if (!candidate.resumeLink) {
      return res.status(404).json({ message: "No resume uploaded yet!" });
    }

    res.json({
      resumeLink: candidate.resumeLink,
      resumeUrl: `http://localhost:${process.env.PORT}/${candidate.resumeLink}`,
    });
  } catch (error) {
    console.error("Error getting resume:", error);
    res.status(500).json({ message: "Error retrieving resume!" });
  }
};

const getDashboard = async (req, res) => {
  try {
    if (req.user.userType !== "Candidate") {
      return res.status(403).json({ message: "Only candidates can access dashboard!" });
    }

    const candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate profile not found!" });
    }

    const applications = await Application.find({ "from.candidateId": candidate._id })
      .populate("forJob.jobId")
      .populate("to.employerId")
      .sort({ createdAt: -1 });

    const totalApplications = applications.length;
    const pendingApplications = applications.filter((app) => app.status === "pending").length;
    const acceptedApplications = applications.filter((app) => app.status === "accepted").length;
    const rejectedApplications = applications.filter((app) => app.status === "rejected").length;

    const recentApplications = applications.slice(0, 5);

    res.json({
      candidate: {
        name: candidate.candidateName,
        email: candidate.candidateMail,
        hasResume: !!candidate.resumeLink,
      },
      statistics: {
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
      },
      recentApplications,
      applications,
    });
  } catch (error) {
    console.error("Error getting dashboard:", error);
    res.status(500).json({ message: "Error retrieving dashboard!" });
  }
};

const getApplications = async (req, res) => {
  try {
    if (req.user.userType !== "Candidate") {
      return res.status(403).json({ message: "Only candidates can view applications!" });
    }

    const candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate profile not found!" });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    let query = { "from.candidateId": candidate._id };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate("forJob.jobId")
      .populate("to.employerId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalApplications: total,
        hasNextPage: pageNumber * limitNumber < total,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Error getting applications:", error);
    res.status(500).json({ message: "Error retrieving applications!" });
  }
};

const getApplicationById = async (req, res) => {
  try {
    if (req.user.userType !== "Candidate") {
      return res.status(403).json({ message: "Only candidates can view applications!" });
    }

    const { id } = req.params;
    const candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate profile not found!" });
    }

    const application = await Application.findOne({
      _id: id,
      "from.candidateId": candidate._id,
    })
      .populate("forJob.jobId")
      .populate("to.employerId");

    if (!application) {
      return res.status(404).json({ message: "Application not found!" });
    }

    res.json({ application });
  } catch (error) {
    console.error("Error getting application:", error);
    res.status(500).json({ message: "Error retrieving application!" });
  }
};

module.exports = {
  searchJob,
  applyForJob,
  uploadResume,
  getResume,
  getDashboard,
  getApplications,
  getApplicationById,
  upload,
};
