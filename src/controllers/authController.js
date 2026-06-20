const { hashPass } = require("../auth/encryption");
const Candidate = require("../models/Candidate");
const Employer = require("../models/Employer");
const User = require("../models/User");

const signup = async (req, res) => {
  try {
    const { username, password, userType, name } = req.body;

    if (!username || !password || !userType || !name) {
      return res.status(400).json({ message: "Username, password, user type and name are required!" });
    }

    if (!['Candidate', 'Employer'].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type!" });
    }

    const findUser = await User.findOne({ username });
    if (findUser) {
      return res.status(409).json({ message: "User already signed up!" });
    }

    const hashed = hashPass(password);
    const newUser = await User.create({ username, password: hashed, userType });

    if (userType === "Employer") {
      await Employer.create({
        userId: newUser._id,
        employerName: name,
      });
    } else if (userType === "Candidate") {
      await Candidate.create({
        userId: newUser._id,
        candidateName: name,
      });
    }

    res.status(201).json({ message: "Sign up successful!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to signup!" });
  }
};

const login = (req, res) => {
  res.json({ message: "Logged In!", user: req.user });
};

const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error during logout" });
    }
    res.json({ message: "Logged out successfully!" });
  });
};

module.exports = {
  signup,
  login,
  logout,
};
