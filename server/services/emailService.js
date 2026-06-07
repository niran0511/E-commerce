const nodemailer = require('nodemailer');
const config = require('../config/config');

/**
 * Create a reusable transporter.
 * In development/test, emails are logged to console.
 */
let transporter = null;

if (config.email.user && config.email.user !== 'your_email@gmail.com') {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
}

/**
 * Send a password-reset email.
 * Falls back to console logging in development.
 */
const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${config.clientUrl}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"ShopAssist" <${config.email.user}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
      <p>This link expires in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Reset email sent to ${email}`);
    } catch (error) {
      console.error('Email send error:', error.message);
    }
  } else {
    console.log('─── EMAIL (Simulated) ───');
    console.log(`To: ${email}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('─────────────────────────');
  }
};

/**
 * Send an order confirmation email.
 */
const sendOrderConfirmationEmail = async (email, order) => {
  const mailOptions = {
    from: `"ShopAssist" <${config.email.user}>`,
    to: email,
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p><strong>Status:</strong> ${order.orderStatus}</p>
      <h3>Items:</h3>
      <ul>
        ${order.items.map((item) => `<li>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</li>`).join('')}
      </ul>
      <p>You can track your order from your account dashboard.</p>
    `,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent to ${email}`);
    } catch (error) {
      console.error('Email send error:', error.message);
    }
  } else {
    console.log('─── EMAIL (Simulated) ───');
    console.log(`To: ${email}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Order: ${order.orderNumber} | Total: ₹${order.totalAmount}`);
    console.log('─────────────────────────');
  }
};

const sendPaymentFailedEmail = async (email, order) => {
  const mailOptions = {
    from: `"ShopAssist" <${config.email.user}>`,
    to: email,
    subject: `Payment Failed - ${order.orderNumber}`,
    html: `
      <h2>Payment Unsuccessful</h2>
      <p>Unfortunately, the payment for your order <strong>${order.orderNumber}</strong> was not successful.</p>
      <p>Please try again or use a different payment method.</p>
    `,
  };

  if (transporter) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Payment failed email sent to ${email}`);
    } catch (error) {
      console.error('Email send error:', error.message);
    }
  } else {
    console.log('─── EMAIL (Simulated) ───');
    console.log(`To: ${email}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Payment Failed for Order: ${order.orderNumber}`);
    console.log('─────────────────────────');
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
};
