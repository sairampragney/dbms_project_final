const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'disaster_user';
const dbPassword = process.env.DB_PASSWORD || 'disaster_password';
const dbName = process.env.DB_NAME || 'disaster_response_db';

console.log(`[DB Config] Initializing MySQL connection pool -> ${dbUser}@${dbHost}:${dbPort}/${dbName}`);

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

module.exports = pool;
