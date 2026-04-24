// backend/services/email.service.js
const nodemailer = require('nodemailer');

// Create Gmail transporter with IPv4 forced
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,  // Use 587 instead of 465 (better for IPv4)
  secure: false, // false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  socketTimeout: 120000, // 120 seconds timeout
  connectionTimeout: 120000,
  // Force IPv4
  family: 4,
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
    console.log('⚠️ Email will fallback to console logging');
  } else {
    console.log('✅ Email service ready to send emails');
  }
});

// Send password reset email
async function sendPasswordResetEmail(to, otp) {
  try {
    const mailOptions = {
      from: `"Akiira Connect" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Reset Your Akiira Connect Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0c0c0e 0%, #1a1a1e 100%); padding: 32px 24px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(145deg, #f59e0b, #d97706); padding: 8px 20px; border-radius: 12px;">
                <span style="font-family: 'Syne', -apple-system, sans-serif; font-size: 22px; font-weight: 800; color: #0c0c0e;">Akiira<strong style="color: white;">Connect</strong></span>
              </div>
              <h1 style="color: white; margin: 20px 0 0 0; font-size: 24px; font-weight: 600;">Reset Your Password</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px 28px;">
              <p style="color: #3f3f46; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                We received a request to reset your password. Use the 6-digit code below to continue.
              </p>
              
              <!-- OTP Box -->
              <div style="background: #f8f8f9; border: 1px solid #e4e4e7; border-radius: 12px; padding: 28px 24px; text-align: center; margin-bottom: 24px;">
                <div style="font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #0c0c0e; font-family: monospace;">
                  ${otp}
                </div>
                <p style="color: #71717a; font-size: 12px; margin-top: 16px;">⏰ This code expires in 15 minutes</p>
              </div>
              
              <p style="color: #3f3f46; font-size: 14px; line-height: 1.6;">
                If you didn't request this, you can safely ignore this email. Your password will not change.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 28px 0 20px;">
              
              <p style="color: #71717a; font-size: 12px; text-align: center; margin: 0;">
                Akiira Connect — Your next remote opportunity awaits
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Akiira Connect - Password Reset
        
        Your OTP code is: ${otp}
        
        This code expires in 15 minutes.
        
        If you didn't request this, please ignore this email.
        
        ---
        Akiira Connect - Find your next remote opportunity
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${to}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    // Return false but don't throw - we'll fallback to console
    return { success: false, error: error.message };
  }
}

module.exports = { sendPasswordResetEmail };