const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
// const fetch = require("node-fetch");

const session = require("express-session");
const flash = require("connect-flash");
const appName = "Growatt";

const {growattUpdater} = require('.utils/growattUpdater')

// mongoose.connect("mongodb://localhost:27017/growatt", {
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
  res.locals.updateInterval = updateInterval;
  res.locals.success = req.flash("success");
  res.locals.failure = req.flash("failure");
  res.locals.infoMessage = req.flash("infoMessage");
  res.locals.errorMessage = req.flash("errorMessage");
  next();
});

app.get("/", (req, res, next) => {
  req.flash("infoMessage", "Welcome!");
  return res.redirect("/growatt");
});

//time ranges
function getLabels(){
  var x = 5; //minutes interval
  var times = []; // time array
  var tt = 6; // start time
  var ap = ['AM', 'PM']; // AM-PM

  //loop to increment the time and push results in array
  for (var i=0;tt<(18*60)+5; i++) {
  var hh = Math.floor(tt/60); // getting hours of day in 0-24 format
  var mm = (tt%60); // getting minutes of the hour in 0-55 format
  // times[i] = ("0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) + ap[Math.floor(hh/12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
  times[i] = hh + ':' + mm;
  }
  return(times);
}

//growatt
("use strict");
const api = require("growatt");
const { stat } = require("fs");
const user = "Aneel Hira";
const passwort = "Solar@Hira";
const options = {};
const options2 = {
  totalData: false,
  plantData: true,
  weather: false,
  deviceData: false,
  historyLast: false,
};
const growatt = new api({});
let login = null;
const db = {
  plantInfo: {
    plantName: "",
    plantIsland: "",
    plantCountry: "",
    createdDate: "",
  },
  data: [],
};
let keepUpdating = true;
let updateInterval = 60000;

async function getLogin() {
  login = await growatt.login(user, passwort).catch((e) => {
    console.log(e);
  });
  return login;
}

growattUpdater()

//growatt home
app.get("/growatt", (req, res, next) => {
  res.render("growatt", {
    db: {
      data: db.data.slice(-5),
      plantInfo: db.plantInfo,
    },
    page: { title: `Growatt - ${appName}`, refreshInSeconds: 0 },
  });
});

//growatt api
app.get("/api/growatt", async (req, res, next) => {
  res.json({
    db: {
      data: db.data.slice(-5),
      plantInfo: db.plantInfo,
    },
    timestamp: new Date().getTime(),
  });
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

app.listen(3000, () => {
  console.log("RUNNING localhost:3000");
});
