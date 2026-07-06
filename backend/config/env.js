require('dotenv').config();

const required = ['MONGODB_URI', 'JWT_SECRET'];

function getEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    port: parseInt(process.env.PORT || '5000', 10),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    adminName: process.env.ADMIN_NAME || 'Admin',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      whatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
    },
    mlServiceUrl: process.env.ML_SERVICE_URL,
  };
}

module.exports = { getEnv };
