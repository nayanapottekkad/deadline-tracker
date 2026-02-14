const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;
const PASSWORD = "in";

app.use(bodyParser.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./deadlines.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS deadlines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT,
      task TEXT,
      datetime TEXT
    )
  `);
});

// Login route
app.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Get deadlines
app.get("/deadlines", (req, res) => {
  db.all("SELECT * FROM deadlines", [], (err, rows) => {
    res.json(rows);
  });
});

// Add deadline
app.post("/deadlines", (req, res) => {
  const { subject, task, datetime } = req.body;
  db.run(
    "INSERT INTO deadlines (subject, task, datetime) VALUES (?, ?, ?)",
    [subject, task, datetime],
    () => res.json({ success: true })
  );
});

// Delete deadline
app.delete("/deadlines/:id", (req, res) => {
  db.run("DELETE FROM deadlines WHERE id = ?", [req.params.id], () =>
    res.json({ success: true })
  );
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:3000/home.html");
});
