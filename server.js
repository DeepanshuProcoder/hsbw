const express = require("express");
const fs = require("fs");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "hsbw-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 } // ⏱ auto logout (10 min)
  })
);

/* ================= ADMIN GUARD ================= */
function isAdmin(req, res, next) {
  if (req.session.admin) return next();
  return res.status(401).json({ success: false });
}

/* ================= ADMIN LOGIN ================= */
const ADMIN_USERNAME = "Ranjit";
const ADMIN_PASSWORD = "3456/R";
const MAX_ATTEMPTS = 5;

app.post("/admin-login", (req, res) => {
  if (!req.session.attempts) req.session.attempts = 0;

  if (req.session.attempts >= MAX_ATTEMPTS) {
    return res.json({ success: false, locked: true });
  }

  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.admin = true;
    req.session.attempts = 0;
    return res.json({ success: true });
  }

  req.session.attempts++;
  res.json({ success: false });
});

/* ================= LOGOUT ================= */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin-login.html");
  });
});

/* ================= FILE HELPERS ================= */
const REG_FILE = "./data/registrations.json";
const DEL_FILE = "./data/deleted.json";

function readJSON(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ================= REGISTER ================= */
app.post("/register", (req, res) => {
  const data = readJSON(REG_FILE);

  data.push({
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toLocaleString("en-IN")
  });

  writeJSON(REG_FILE, data);
  res.json({ success: true });
});

/* ================= ADMIN APIs ================= */
app.get("/admin/registrations", isAdmin, (req, res) => {
  res.json(readJSON(REG_FILE));
});

app.get("/admin/deleted", isAdmin, (req, res) => {
  res.json(readJSON(DEL_FILE));
});

/* ================= DELETE ================= */
app.delete("/admin/delete/:id", isAdmin, (req, res) => {
  let regs = readJSON(REG_FILE);
  let del = readJSON(DEL_FILE);

  const id = String(req.params.id);
  const index = regs.findIndex(r => String(r.id) === id);

  if (index === -1) {
    return res.json({ success: false });
  }

  const removed = regs.splice(index, 1)[0];
  del.push(removed);

  writeJSON(REG_FILE, regs);
  writeJSON(DEL_FILE, del);

  res.json({ success: true });
});

/* ================= RESTORE ================= */
app.post("/admin/restore/:id", isAdmin, (req, res) => {
  let regs = readJSON(REG_FILE);
  let del = readJSON(DEL_FILE);

  const id = String(req.params.id);
  const index = del.findIndex(r => String(r.id) === id);

  if (index === -1) {
    return res.json({ success: false });
  }

  const restored = del.splice(index, 1)[0];
  regs.push(restored);

  writeJSON(REG_FILE, regs);
  writeJSON(DEL_FILE, del);

  res.json({ success: true });
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
