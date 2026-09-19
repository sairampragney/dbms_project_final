const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Disaster Alert Backend API Server Running`);
  console.log(`📡 Listening on Port: ${PORT}`);
  console.log(`🔗 API Base Route: http://localhost:${PORT}/api/v1`);
  console.log(`====================================================`);
});
