const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db.db');

module.exports = db;