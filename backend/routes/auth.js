// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/email.service');

const router = express.Router();

// ============================================
// REGISTER - Create a new account
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      role, 
      companyName, 
      companySize, 
      industry,
      agreeToTerms 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      fullName,
      email,
      passwordHash,
      role,
      companyName: role === 'employer' ? companyName : undefined,
      companySize: role === 'employer' ? companySize : undefined,
      industry: role === 'employer' ? industry : undefined,
      onboarded: false
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return response (without password)
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        onboarded: user.onboarded
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ============================================
// LOGIN - Authenticate existing user
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        onboarded: user.onboarded
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ============================================
// GOOGLE SIGN-IN - Create or login user with Google
// ============================================
router.post('/google', async (req, res) => {
  try {
    const { email, fullName, googleId, picture } = req.body;

    console.log('Google sign-in request for:', email);

    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (!user) {
      // Generate a random password for Google users (since passwordHash is required)
      const randomPassword = Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);
      
      // Create new user
      user = new User({
        fullName: fullName,
        email: email,
        googleId: googleId,
        role: 'freelancer', // Default role, can change during onboarding
        onboarded: false,
        passwordHash: passwordHash, // ← Now has a valid hash instead of empty string
        profile: {
          picture: picture || ''
        }
      });
      await user.save();
      console.log(`📝 New Google user created: ${email}`);
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
        console.log(`🔄 Updated existing user with Google ID: ${email}`);
      }
      console.log(`✅ Existing user logged in with Google: ${email}`);
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        onboarded: user.onboarded
      }
    });

  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Server error during Google sign-in: ' + error.message });
  }
});

// ============================================
// GET CURRENT USER - For validating token
// ============================================
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        onboarded: user.onboarded,
        profile: user.profile || {}
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

// ============================================
// COMPLETE ONBOARDING - Mark user as onboarded
// ============================================
router.post('/complete-onboarding', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { onboarded: true },
      { returnDocument: 'after' }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        onboarded: user.onboarded
      }
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ============================================
// UPDATE FREELANCER PROFILE
// ============================================
router.put('/profile/freelancer', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const {
      headline,
      bio,
      location,
      phone,
      skills,
      hourlyRate,
      availability,
      jobTypes,
      remoteOnly,
      github,
      linkedin,
      twitter,
      website
    } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        profile: {
          headline,
          bio,
          location,
          phone,
          skills: skills || [],
          hourlyRate,
          availability,
          jobTypes: jobTypes || [],
          remoteOnly: remoteOnly || false,
          github,
          linkedin,
          twitter,
          website
        }
      },
      { returnDocument: 'after' }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: user.profile
    });

  } catch (error) {
    console.error('Update freelancer profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ============================================
// UPDATE EMPLOYER PROFILE
// ============================================
router.put('/profile/employer', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const {
      companyWebsite,
      companyDescription,
      companyLogo,
      headquarters,
      foundedYear,
      hiringRoles,
      remotePolicy,
      companySize,
      industry,
      tagline,
      mission,
      culture,
      hiringVolume,
      budgetRange,
      contractTypes,
      linkedin,
      twitter,
      github,
      glassdoor
    } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        companyWebsite,
        companyDescription,
        companyLogo,
        headquarters,
        foundedYear,
        hiringRoles: hiringRoles || [],
        remotePolicy,
        companySize: companySize || user.companySize,
        industry: industry || user.industry,
        tagline,
        mission,
        culture,
        hiringVolume,
        budgetRange,
        contractTypes: contractTypes || [],
        linkedin,
        twitter,
        github,
        glassdoor
      },
      { returnDocument: 'after' }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      company: {
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
        companyDescription: user.companyDescription,
        companySize: user.companySize,
        industry: user.industry,
        headquarters: user.headquarters,
        hiringRoles: user.hiringRoles,
        tagline: user.tagline,
        mission: user.mission,
        culture: user.culture,
        hiringVolume: user.hiringVolume,
        budgetRange: user.budgetRange,
        contractTypes: user.contractTypes,
        linkedin: user.linkedin,
        twitter: user.twitter,
        github: user.github,
        glassdoor: user.glassdoor
      }
    });

  } catch (error) {
    console.error('Update employer profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ============================================
// FORGOT PASSWORD - Send OTP email
// ============================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal that email doesn't exist
      return res.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database with expiry (15 minutes)
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send email with OTP
    const emailResult = await sendPasswordResetEmail(email, otp);
    
    if (emailResult.success) {
      console.log(`📧 Password reset OTP sent to ${email}`);
    } else {
      console.log(`⚠️ Failed to send email to ${email}, but OTP stored for fallback`);
      console.log(`📝 Fallback OTP for ${email}: ${otp}`);
    }

    res.json({ success: true, message: 'If an account exists, a reset code has been sent.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ============================================
// VERIFY OTP
// ============================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    // Check OTP and expiry
    if (!user.resetOtp || user.resetOtp !== otp || Date.now() > user.resetOtpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    // Generate a temporary reset token
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ success: true, resetToken });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ============================================
// RESET PASSWORD
// ============================================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid request.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset fields
    user.passwordHash = passwordHash;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    console.log(`🔐 Password reset successful for ${email}`);

    res.json({ success: true, message: 'Password reset successfully.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ============================================
// GET USER PROFILE
// ============================================
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Return role-specific profile
    if (user.role === 'freelancer') {
      res.json({
        success: true,
        role: 'freelancer',
        profile: user.profile || {},
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          onboarded: user.onboarded
        }
      });
    } else {
      res.json({
        success: true,
        role: 'employer',
        company: {
          companyName: user.companyName,
          companyWebsite: user.companyWebsite,
          companyDescription: user.companyDescription,
          companySize: user.companySize,
          industry: user.industry,
          headquarters: user.headquarters,
          hiringRoles: user.hiringRoles,
          tagline: user.tagline,
          mission: user.mission,
          culture: user.culture,
          hiringVolume: user.hiringVolume,
          budgetRange: user.budgetRange,
          contractTypes: user.contractTypes,
          linkedin: user.linkedin,
          twitter: user.twitter,
          github: user.github,
          glassdoor: user.glassdoor
        },
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          onboarded: user.onboarded
        }
      });
    }

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

module.exports = router;