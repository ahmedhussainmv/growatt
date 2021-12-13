require("dotenv").config({ path: "./config.env" });
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
// const fetch = require("node-fetch");

const session = require("express-session");
const flash = require("connect-flash");
const appName = "Growatt";

const {growattInitialize, getLogin, getGrowattDb, getAll} = require('./utils/exports')

// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//   console.log("Database connected");
// });

const app = express();
// const methodOverride = require("method-override");

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
app.use(
  session({ secret: "customSecret", resave: false, saveUninitialized: false })
);
app.use(flash());

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

//middleware for all routes
app.use(async (req, res, next) => {
  res.locals.user_id = req.session.user_id ? req.session.user_id : "";
  res.locals.todayIs = new Date().getDate();
  res.locals.timestamp = new Date();
  res.locals.UPDATE_INTERVAL = process.env.UPDATE_INTERVAL;
  res.locals.PORT = process.env.PORT;
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  res.locals.infoMessage = req.flash("infoMessage");
  res.locals.errorMessage = req.flash("errorMessage");
  next();
});



//growatt home
app.get("", (req, res, next) => {
  const ddb = getGrowattDb();
  res.render("growatt", {ddb,
    page: { title: `Growatt - ${appName}`, refreshInSeconds: 0 },
  });
});

//growatt api
app.get("/api", async (req, res, next) => {
  const ddb = getGrowattDb();
  res.json({
    db: {
      data: ddb.data.slice(-5),
      plantInfo: ddb.plantInfo,
    },
    timestamp: new Date().getTime(),
  });
});
app.get("/all", async (req, res, next) => {
  res.json(await getAll())
});

//login
app.get("/login", async (req, res, next) => {
  login = getLogin();
  res.send("login:" + JSON.stringify(login));
});

//logout
app.get("/logout", async (req, res, next) => {
  let logout = await growatt.logout().catch((e) => {
    console.log(e);
  });
  res.send("logout:" + JSON.stringify(logout));
});

app.all("*", (req, res, next) => {
  console.log("Page not fount! 404", req.url);
  //res.render("error", { errorMessage: "Page not fount! 404", page: { title: `EZApp - 404` } });
  next();
});

//main error handler
app.use((err, req, res, next) => {
  console.log("MAIN ERROR HANDLER:", err.status, err);
  //res.render("error", { errorMessage: err.message, page: { title: `EZApp - Something went wrong!` } });
});

app.listen(PORT, () => {
  console.log(`Growatt RUNNING on localhost:${PORT}`);
  growattInitialize()
});

