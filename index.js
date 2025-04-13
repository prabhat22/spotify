const express = require("express");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();


app.set("views", path.join(__dirname, "views"));

// Import Routes
const spotifyRoutes = require("./routes/route");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret", 
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use("/spotify", spotifyRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
