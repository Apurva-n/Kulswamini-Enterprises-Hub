const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { getEnv } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const { port, clientUrl } = getEnv();

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

module.exports = app;
