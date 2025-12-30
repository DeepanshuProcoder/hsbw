const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "hsbw_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

const DATA_FILE = path.join(__dirname, "registrations.json");

/* ---------- ADMIN LOGIN ---------- */
app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "12345") {
    req.session.admin = true;
    res.redirect("/admin.html");
  } else {
    res.redirect("/admin-login.html?error=1");
  }
});

/* ---------- ADMIN PAGE PROTECTION ---------- */
app.get("/admin.html", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin-login.html");
  }
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

/* ---------- LOGOUT ---------- */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin-login.html");
  });
});

/* ---------- USER REGISTRATION ---------- */
app.post("/register", (req, res) => {
  const { name, email, phone, checkin, days } = req.body;

  const newEntry = {
    name,
    email,
    phone,
    checkin,
    days,
    createdAt: new Date().toLocaleString(),
  };

  let data = [];
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
  }

  data.push(newEntry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.redirect("/register.html?success=1");
});

/* ---------- ADMIN FETCH REGISTRATIONS ---------- */
app.get("/api/registrations", (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!fs.existsSync(DATA_FILE)) {
    return res.json([]);
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`HSBW running on http://localhost:${PORT}`);
});
