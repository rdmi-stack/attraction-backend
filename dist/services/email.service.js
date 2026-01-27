"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUserInvitation = exports.sendPasswordResetEmail = exports.sendBookingConfirmation = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
// Create transporter
const transporter = env_1.env.smtpUser
    ? nodemailer_1.default.createTransport({
        host: env_1.env.smtpHost,
        port: env_1.env.smtpPort,
        secure: env_1.env.smtpPort === 465,
        auth: {
            user: env_1.env.smtpUser,
            pass: env_1.env.smtpPass,
        },
    })
    : null;
const sendEmail = async (options) => {
    if (!transporter) {
        console.log('Email service not configured. Would send:', options.subject, 'to:', options.to);
        return;
    }
    await transporter.sendMail({
        from: env_1.env.emailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
    });
};
exports.sendEmail = sendEmail;
const sendBookingConfirmation = async (email, bookingDetails, ticketPdf) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed, #c026d3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .label { color: #6b7280; }
        .value { font-weight: 600; }
        .total { font-size: 24px; color: #7c3aed; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed! 🎉</h1>
          <p>Your adventure awaits</p>
        </div>
        <div class="content">
          <p>Hi ${bookingDetails.guestName},</p>
          <p>Great news! Your booking has been confirmed. Here are your details:</p>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="label">Booking Reference</span>
              <span class="value">${bookingDetails.reference}</span>
            </div>
            <div class="detail-row">
              <span class="label">Experience</span>
              <span class="value">${bookingDetails.attractionTitle}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date</span>
              <span class="value">${bookingDetails.date}${bookingDetails.time ? ` at ${bookingDetails.time}` : ''}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Paid</span>
              <span class="value total">${bookingDetails.currency} ${bookingDetails.total.toFixed(2)}</span>
            </div>
          </div>
          
          <p>Your e-ticket is attached to this email. Simply show it on your phone at the venue.</p>
          
          <center>
            <a href="${env_1.env.frontendUrl}/dashboard/bookings" class="button">View My Bookings</a>
          </center>
        </div>
        <div class="footer">
          <p>Questions? Contact us at support@attractions-network.com</p>
          <p>© ${new Date().getFullYear()} Attractions Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
    await (0, exports.sendEmail)({
        to: email,
        subject: `Booking Confirmed - ${bookingDetails.reference}`,
        html,
        attachments: ticketPdf
            ? [{ filename: `ticket-${bookingDetails.reference}.pdf`, content: ticketPdf }]
            : undefined,
    });
};
exports.sendBookingConfirmation = sendBookingConfirmation;
const sendPasswordResetEmail = async (email, resetToken, userName) => {
    const resetUrl = `${env_1.env.frontendUrl}/reset-password?token=${resetToken}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <center>
            <a href="${resetUrl}" class="button">Reset Password</a>
          </center>
          
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Attractions Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
    await (0, exports.sendEmail)({
        to: email,
        subject: 'Reset Your Password - Attractions Network',
        html,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendUserInvitation = async (email, invitationToken, inviterName, role) => {
    const inviteUrl = `${env_1.env.frontendUrl}/accept-invitation?token=${invitationToken}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed, #c026d3); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited! 🎉</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>${inviterName} has invited you to join Attractions Network as a <strong>${role}</strong>.</p>
          <p>Click the button below to accept the invitation and set up your account:</p>
          
          <center>
            <a href="${inviteUrl}" class="button">Accept Invitation</a>
          </center>
          
          <p>This invitation will expire in 7 days.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Attractions Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
    await (0, exports.sendEmail)({
        to: email,
        subject: `You're invited to join Attractions Network`,
        html,
    });
};
exports.sendUserInvitation = sendUserInvitation;
//# sourceMappingURL=email.service.js.map