const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: "hsbw_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

/* ---------- LOGIN ---------- */
app.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "12345") {
    req.session.admin = true;
    res.redirect("/admin.html");
  } else {
    res.redirect("/admin-login.html?error=1");
  }
});


/* ---------- PROTECT ADMIN ---------- */
app.get("/admin.html", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin-login.html");
  }
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

/* ---------- LOGOUT (THIS FIXES YOUR ERROR) ---------- */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin-login.html");
  });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
