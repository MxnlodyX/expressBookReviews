const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // แหล่งเก็บ user จริง

// ตรวจสอบ username ซ้ำ
const isValid = (username) => {
  let userswithsamename = users.filter((user) => user.username === username);
  return userswithsamename.length > 0;
};

// ตรวจสอบ username และ password
const authenticatedUser = (username, password) => {
  let validuser = users.filter(
    (user) => user.username === username && user.password === password
  );
  return validuser.length > 0;
};

// ---------------- LOGIN ----------------
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username: username },
      "access",
      { expiresIn: "1h" }
    );
    req.session.authorization = { accessToken, username };
    return res
      .status(200)
      .json({ message: "User successfully logged in", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; 
    const username = req.session.authorization?.username; // ดึงชื่อผู้ใช้จาก session
  
    if (!username) {
      return res.status(401).json({ message: "You must be logged in to post a review" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review query parameter is required" });
    }
  
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({
      message: "Review added/modified successfully",
      reviews: books[isbn].reviews
    });
  });
  
  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
  
    // ตรวจสอบการล็อกอิน
    if (!username) {
      return res.status(401).json({ message: "You must be logged in to delete a review" });
    }
  
    // ตรวจสอบว่าหนังสือมีอยู่ในระบบไหม
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // ตรวจสอบว่าหนังสือมีรีวิวไหม
    if (!books[isbn].reviews) {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  
    // ตรวจสอบว่ารีวิวนี้เป็นของผู้ใช้คนนี้หรือเปล่า
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({
        message: "Your review was deleted successfully",
        reviews: books[isbn].reviews
      });
    } else {
      return res.status(403).json({
        message: "You can only delete your own reviews or you have not reviewed this book yet"
      });
    }
  });
module.exports = {
  authenticated: regd_users,
  isValid,
  users,
};
