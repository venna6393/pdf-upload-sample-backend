const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // Increase limit to handle large files

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "9701386393",
  database: "storepdf",
};

app.post("/upload", async (req, res) => {
  const { fileName, fileData } = req.body;

  if (!fileName || !fileData) {
    return res.status(400).send("No file data provided.");
  }

  const binaryData = Buffer.from(fileData, "base64");

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute("INSERT INTO pdfs (name, data) VALUES (?, ?)", [
      fileName,
      binaryData,
    ]);
    await connection.end();
    res.send("File uploaded!");
  } catch (err) {
    console.error("Database Error: ", err);
    res.status(500).send(err.message);
  }
});

app.get("/pdfs", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT id, name FROM pdfs");
    await connection.end();
    res.json(rows);
  } catch (err) {
    console.error("Database Error: ", err);
    res.status(500).send(err.message);
  }
});

app.get("/pdfs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT name, data FROM pdfs WHERE id = ?",
      [id]
    );
    await connection.end();
    if (rows.length > 0) {
      const pdfData = rows[0].data.toString("base64");
      const pdf = {
        name: rows[0].name,
        data: pdfData,
      };
      res.json(pdf);
    } else {
      res.status(404).send("PDF not found");
    }
  } catch (err) {
    console.error("Database Error: ", err);
    res.status(500).send(err.message);
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
