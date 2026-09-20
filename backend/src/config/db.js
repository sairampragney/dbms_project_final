const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || process.env.AIVEN_MYSQL_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || process.env.AIVEN_MYSQL_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'disaster_user';
const dbPassword = process.env.DB_PASSWORD || process.env.AIVEN_MYSQL_PASSWORD || 'disaster_password';
const dbName = process.env.DB_NAME || 'disaster_response_db';
const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';

console.log(`[DB Config] Initializing MySQL connection pool -> ${dbUser}@${dbHost}:${dbPort}/${dbName} (SSL: ${useSsl})`);

const poolConfig = {
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
};

if (useSsl) {
  poolConfig.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
  };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
