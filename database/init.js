const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('./../config')

const db = new sqlite3.Database(dbPath);

// Set up the table (run this once to set up the database)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS process_control (
      function_name TEXT PRIMARY KEY,
      is_running BOOLEAN
    )
  `);
    //   db.run(`INSERT OR REPLACE INTO function_control (function_name, is_running) VALUES ('myFunction', 1)`);
    //   db.run(`INSERT OR REPLACE INTO function_control (function_name, is_running) VALUES ('otherFunction', 0)`);
});
