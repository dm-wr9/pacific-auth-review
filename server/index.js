require("dotenv").config();
const express = require("express");
const massive = require("massive");
const session = require("express-session");
const app = express();
const ctrl = require("./controller");

const { CONNECTION_STRING, SERVER_PORT, SESSION_SECRET } = process.env;

app.use(express.json());
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

massive({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
})
  .then((db) => {
    app.set("db", db);
    console.log("DB connected");
  })
  .catch((err) => console.log(err));

app.post("/api/register", ctrl.register);
app.post("/api/login", ctrl.login);
app.delete("/api/logout", ctrl.logout);

const port = SERVER_PORT || 4040;
app.listen(port, () => console.log(`Server running on port ${port}`));
