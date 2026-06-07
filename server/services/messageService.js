const twilio = require('twilio');
const { sendOrderConfirmationEmail, sendPaymentFailedEmail } = require('./emailService');

const sendSuccessMessage = async (order, email, phone) => {
  // Send Email
  if (email) {
    await sendOrderConfirmationEmail(email, order);
  }

  // Send SMS
  try {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER && TWILIO_PHONE_NUMBER !== 'YOUR_TWILIO_PHONE_NUMBER_HERE') {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      if (phone) {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        await client.messages.create({
          body: `Hi ${order.shippingAddress?.name || 'Customer'}, your order #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()} has been successfully placed! Total: ₹${order.totalAmount}. Thank you for shopping with ShopSmart.`,
          from: TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });
      }
    }
  } catch (error) {
    console.error('Failed to send success SMS:', error.message);
  }
};

const sendFailureMessage = async (order, email, phone) => {
  // Send Email
  if (email) {
    await sendPaymentFailedEmail(email, order);
  }

  // Send SMS
  try {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER && TWILIO_PHONE_NUMBER !== 'YOUR_TWILIO_PHONE_NUMBER_HERE') {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      if (phone) {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        await client.messages.create({
          body: `Hi ${order.shippingAddress?.name || 'Customer'}, the payment for your order #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()} was unsuccessful. Please try again or use a different payment method.`,
          from: TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });
      }
    }
  } catch (error) {
    console.error('Failed to send failure SMS:', error.message);
  }
};

module.exports = { sendSuccessMessage, sendFailureMessage };
