// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true },
    
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['freelancer', 'employer'], 
    required: true 
  },
  resetOtp: { type: String },

  resetOtpExpiry: { type: Number },
  
  onboarded: { 
    type: Boolean, 
    default: false 
  },
  // Employer specific fields
  companyName: { type: String },
  companySize: { type: String },
  industry: { type: String },
  companyWebsite: { type: String },
  companyDescription: { type: String },
  companyLogo: { type: String },
  headquarters: { type: String },
  foundedYear: { type: Number },
  hiringRoles: [{ type: String }],
  remotePolicy: { type: String },
  tagline: { type: String },
  mission: { type: String },
  culture: { type: String },
  hiringVolume: { type: String },
  budgetRange: { type: String },
  contractTypes: [{ type: String }],
  linkedin: { type: String },
  twitter: { type: String },
  github: { type: String },
  glassdoor: { type: String },
  // Freelancer profile fields
  profile: {
    headline: String,
    bio: String,
    location: String,
    phone: String,
    skills: [String],
    hourlyRate: Number,
    availability: String,
    jobTypes: [String],
    remoteOnly: Boolean,
    github: String,
    linkedin: String,
    twitter: String,
    website: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);