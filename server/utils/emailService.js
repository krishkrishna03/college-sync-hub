const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendLoginCredentials(userEmail, userName, password, role, collegeName = null) {
    const roleText = this.getRoleDisplayName(role);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Login Credentials - ${roleText} Account Created`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
            <h1>Academic Management System</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Welcome, ${userName}!</h2>
            <p>Your ${roleText} account has been created successfully.</p>
            ${collegeName ? `<p><strong>College:</strong> ${collegeName}</p>` : ''}
            
            <div style="background-color: white; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0;">
              <h3>Login Credentials:</h3>
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            
            <p style="color: #dc2626; font-weight: bold;">
              ⚠️ Please change your password after first login for security reasons.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login Now
              </a>
            </div>
          </div>
          <div style="background-color: #374151; color: white; text-align: center; padding: 10px;">
            <p>Academic Management System © 2025</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendPasswordReset(userEmail, userName, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Password Reset Request - Academic Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3B82F6; color: white; padding: 20px; text-align: center;">
            <h1>Password Reset Request</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Hello, ${userName}!</h2>
            <p>You requested a password reset for your Academic Management System account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in 10 minutes. If you didn't request this reset, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Password reset email failed:', error);
      return false;
    }
  }

  getRoleDisplayName(role) {
    const roleNames = {
      master_admin: 'Master Administrator',
      college_admin: 'College Administrator',
      faculty: 'Faculty',
      student: 'Student'
    };
    return roleNames[role] || role;
  }
}

module.exports = new EmailService();