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
        const tokenUser = Element;
        console.log(tokenUser);
        jwt.sign({ user: tokenUser }, "secretkey", (err, token) => {
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

app.get("/comments", (req, res) => {
  connection.query("SELECT * FROM comments inner join users on comments.id_user = users.id inner join forum on comments.id_forum = forum.id", (err, results) => {
    if (err) {
      console.log("hay un error ", err);
      res.json({
        error: `Hubo un error: ${err}`,
      });
      return;
    }
    res.json(results);
    })
}) 

app.post("/insertcomments", (req, res) => {

  const { id_user, id_forum, comment} = req.body;
  
  connection.query("INSERT INTO comments SET ?",{ id_user, id_forum, comment }, (err, results) => {
    if (err) {
      console.log("hay un error ", err);
      res.json({
        error: `Hubo un error: ${err}`,
      });
      return;
    }
    res.json({ mensaje: "Usuario insertado" });
    console.log(results);
    })
})

app.get("/forum/:id", (req, res) => {

  const { id } = req.params;

  connection.query(`SELECT * FROM forum inner join comments on forum.id = comments.id_forum inner join users on comments.id_user = users.id where forum.id = ${ id } order by comments.id_comment asc`, (err, results) => {
    if (err) {
      console.log("hay un error ", err);
      res.json({
        error: `Hubo un error: ${err}`,
      });
      return;
    }
      
      res.json(results);
    
    })
}) 

app.get("/forum2", (req, res) => {

  const { id } = req.params;

  connection.query(`SELECT * FROM forum`, (err, results) => {
    if (err) {
      console.log("hay un error ", err);
      res.json({
        error: `Hubo un error: ${err}`,
      });
      return;
    }
      
      res.json(results);
    
    })
})

app.listen(3000, () => {
  console.log("Server corriendo en http://localhost:3000");
});
