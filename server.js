const express = require("express");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "hsbw_secret_key",
    resave: false,
    saveUninitialized: false
  })
);

// TEMP DATABASE
let bookings = [];

// ADMIN CREDENTIALS (change later)
const ADMIN_USER = "Shashi";
const ADMIN_PASS = "12345678900";

// 🔐 Admin Login
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = true;
    res.redirect("/admin.html");
  } else {
    res.send("Invalid Admin Credentials");
  }
});

// 🔒 Protect Admin Route
app.get("/admin.html", (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin-login.html");
  }
});

// Logout
app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin-login.html");
  });
});

// Booking API
app.post("/book", (req, res) => {
  bookings.push({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    date: req.body.date,
    status: "Confirmed"
  });
  res.json({ success: true });
});

// Admin fetch bookings
app.get("/admin/bookings", (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(bookings);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
