const { getEnv } = require('../config/env');
const twilio = require('twilio');

class NoOpNotificationService {
  async notifyOrderStatusChange(order, shop, status) {
    console.log(`[Notification] Order ${order.invoiceNumber} → ${status} for shop ${shop?.name || shop}`);
  }

  async notifyPaymentRecorded(payment, shop) {
    console.log(`[Notification] Payment ₹${payment.amount} recorded for shop ${shop.name}`);
  }
}

class TwilioWhatsAppAdapter {
  constructor() {
    const { twilio: twilioConfig } = getEnv();
    this.accountSid = twilioConfig.accountSid;
    this.authToken = twilioConfig.authToken;
    this.whatsappFrom = twilioConfig.whatsappFrom;
    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
    }
  }

  _ensureConfigured() {
    if (!this.client || !this.whatsappFrom) {
      throw new Error('Twilio WhatsApp is not configured. Set TWILIO_* environment variables.');
    }
  }

  async notifyOrderStatusChange(order, shop, status) {
    this._ensureConfigured();
    const phone = shop.phone.startsWith('+') ? shop.phone : `+91${shop.phone}`;
    const body = `Hello ${shop.ownerName}, your order #${order.invoiceNumber} status has been updated to "${status}". Total amount: ₹${order.totalAmount}.`;
    
    try {
      const message = await this.client.messages.create({
        from: `whatsapp:${this.whatsappFrom}`,
        to: `whatsapp:${phone}`,
        body
      });
      console.log(`[Twilio SMS] Notification sent. SID: ${message.sid}`);
    } catch (error) {
      console.error(`[Twilio Error] Failed to send WhatsApp notification: ${error.message}`);
    }
  }

  async notifyPaymentRecorded(payment, shop) {
    this._ensureConfigured();
    const phone = shop.phone.startsWith('+') ? shop.phone : `+91${shop.phone}`;
    const body = `Hello ${shop.ownerName}, we have successfully recorded your payment of ₹${payment.amount} via ${payment.method}. Thank you!`;
    
    try {
      const message = await this.client.messages.create({
        from: `whatsapp:${this.whatsappFrom}`,
        to: `whatsapp:${phone}`,
        body
      });
      console.log(`[Twilio SMS] Notification sent. SID: ${message.sid}`);
    } catch (error) {
      console.error(`[Twilio Error] Failed to send WhatsApp payment notification: ${error.message}`);
    }
  }
}

function createNotificationService() {
  const { twilio: twilioConfig } = getEnv();
  if (twilioConfig.accountSid && twilioConfig.authToken && twilioConfig.whatsappFrom) {
    return new TwilioWhatsAppAdapter();
  }
  return new NoOpNotificationService();
}

module.exports = createNotificationService();

