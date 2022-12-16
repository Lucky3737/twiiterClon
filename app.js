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
let covertUser = (dbObject) => {
  return {
    userId: dbObject.user_id,
    name: dbObject.name,
    username: dbObject.username,
    password: dbObject.password,
    gender: dbObject.gender,
  };
};

app.post("/register/", async (request, response) => {
  const { username, password, name, gender } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  let registerUser = `
  select * from user where username="${username}"
  `;
  let usersDetails = await db.get(registerUser);
  console.log(usersDetails);
  try {
    if (usersDetails === undefined) {
      const user = `
          INSERT INTO user (username,password,name,gender){
          VALUES ("${username}","${hashedPassword}","${name}","${gender}")
          
          `;
      const updateDetails = await db.run(user);
      const l = updateDetails.password;
      if (l < 6) {
        response.status(400);
        response.send("Password is too short");
      } else {
        response.status(200);
        response.send("User created successfully");
      }
    } else {
      response.status(400);
      response.send("User already exists");
    }
  } catch (e) {
    console.log(`Db error : ${e.message}`);
  }
});
