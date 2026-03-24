import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

const COLLEGE_DOMAINS = [
  ".edu",
  ".ac.in",
  ".edu.in",
  ".ac.uk",
  ".college",
  ".university",
];

const isCollegeEmail = (email) => {
  return COLLEGE_DOMAINS.some((d) => email.toLowerCase().includes(d));
};

export const signup = async (req, res) => {
  try {
    // If the body is empty or unparsable, return a clear JSON error.
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ error: "Request body must be valid JSON." });
    }

    const {
      name,
      email,
      password,
      role,
      company,
      jobRole,
      experience,
      linkedin,
      adminKey,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: "Missing required fields: name, email, password, role",
      });
    }

    if (role === "admin") {
      if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: "Invalid admin key." });
      }
    }

    if (role === "student" && !isCollegeEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please use a valid college email address." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ error: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const tempId = uuidv4();
    otpStore.set(email, {
      otp,
      userData: {
        id: tempId,
        name,
        email,
        password: hashedPassword,
        role: role || "student",
        company: company || null,
        job_role: jobRole || null,
        experience: experience || null,
        linkedin: linkedin || null,
        verification_status: role === "alumni" ? "pending" : "approved",
        profile_score: 10,
        skills: [],
        created_at: new Date().toISOString(),
      },
      expires: Date.now() + 10 * 60 * 1000,
    });

    console.log(`[DEV] OTP for ${email}: ${otp}`);
    res.json({ message: "OTP sent successfully", devOtp: otp, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (!stored)
      return res.status(400).json({ error: "OTP expired or not found." });
    if (Date.now() > stored.expires) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP has expired." });
    }

    // Accept any 6-digit OTP in dev mode OR the actual OTP
    if (otp !== stored.otp && !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    const user = new User(stored.userData);
    await user.save();
    otpStore.delete(email);

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    if (user.role === "admin") {
      if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: "Invalid admin key." });
      }
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
