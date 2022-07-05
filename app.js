const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const connection = require("./bd");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.post("/login", (req, res) => {
  connection.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.log("hay un error ", err);
      res.json({
        error: `Hubo un error: ${err}`,
      });
      return;
    }

    const { user, password } = req.body;

    results.forEach((Element) => {
      if (Element.user == user && Element.password == password) {
        const tokenUser = Element.username;
        console.log(tokenUser);
        jwt.sign({ username: tokenUser }, "secretkey", (err, token) => {
          res.json({ token });
          console.log(jwt.decode(token));
        });
      }
    });
    console.log(req.body);
  });
});

app.post("/post", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (error, authData) => {
    if (error) {
      res.status(401).json("No autorizado");
    } else {
      res.json({
        mensaje: "post siuuu",
        authData,
      });
    }
  });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(401);
  }
}

app.post("/register", (req, res) => {

  const { user, password, username } = req.body;

  connection.query(
    "INSERT INTO users SET ?",
    { user, password, username },
    (err, results) => {
      if (err) {
        console.log("hay un error ", err);
        res.json({
          error: `Hubo un error: ${err}`,
        });
        return;
      }
      res.json({ mensaje: "Usuario insertado" });
      console.log(results);
    }
  );
});

app.listen(3000, () => {
  console.log("Server corriendo en http://localhost:3000");
});
