const app = require('./app');
const { initDb } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Ensure database and schema are ready
    await initDb();

    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Expense Voucher Backend Server running on port ${PORT}`);
      console.log(`🌐 Web Application UI: http://localhost:3000`);
      console.log(`📡 API Health Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
};

startServer();
