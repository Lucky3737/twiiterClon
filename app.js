const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dbPath = path.join(__dirname, "twitterClone.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const { userId } = request.params;
  let hashedPassword = await bcrypt.hashSync(password, 10);

  let registerUser = `
  select * from user where username="${username}"
  `;
  let users = await db.get(registerUser);
  try {
    if (users === undefined) {
      let createUser = `
      INSERT INTO 
      user (name,username,password,gender)
      VALUES ("${username}","${hashedPassword}","${name}","${gender}")
      `;
      let user = await db.run(createUser);
      response.send("user updated");
    } else {
      response.status(400);
      response.send("User alredy exits");
    }
  } catch (e) {
    console.log(`Db error : ${e.message}`);
  }
});
