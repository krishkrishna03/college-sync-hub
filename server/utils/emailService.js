const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send credentials email
const sendCredentialsEmail = async (email, name, password, role, collegeName = '') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your College Portal Account Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to ${collegeName || 'College Portal'}</h2>
          <p>Dear ${name},</p>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Role:</strong> ${role}</p>
            ${collegeName ? `<p><strong>College:</strong> ${collegeName}</p>` : ''}
          </div>
          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
          <p>You can access the portal at: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
          <p>Best regards,<br>${collegeName || 'College'} Administration</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send invitation email
const sendInvitationEmail = async (email, name, token, role, collegeName = '') => {
  try {
    const transporter = createTransporter();
    const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Invitation to join ${collegeName || 'College Portal'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You're Invited to Join ${collegeName || 'College Portal'}</h2>
          <p>Dear ${name},</p>
          <p>You have been invited to join ${collegeName || 'the college portal'} as a ${role}.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>College:</strong> ${collegeName}</p>
          </div>
          <p>Click the button below to accept the invitation and set up your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a>
          </div>
          <p><strong>Note:</strong> This invitation will expire in 7 days.</p>
          <p>If you cannot click the button, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${invitationUrl}</p>
          <p>Best regards,<br>${collegeName || 'College'} Administration</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Invitation email error:', error);
    return { success: false, error: error.message };
  }
};

// Send announcement email
const sendAnnouncementEmail = async (emails, title, content) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: emails,
      subject: `College Announcement: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <div style="line-height: 1.6;">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from College Portal. Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Announcement email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendCredentialsEmail,
  sendInvitationEmail,
  sendAnnouncementEmail
};