const express = require('express');
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get all books
public_users.get('/', async (req, res) => {
    try{
        const getBooks = new Promise((resolve, reject) =>{
            if(books) resolve(books);
            else reject("No books found")
        })
        const bookList = await getBooks;
        return res.status(200).json(bookList);
    }catch(err){
        return res.status(500).json({ message: err });
    }
});

// Get by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try{
        const isbn = req.params.isbn;
        const getBookISBN = new Promise((resolve,reject) =>{
            if(books[isbn]) resolve(books[isbn]);
            else reject('Book not found')
        })
        const book = await getBookISBN;
        return res.status(200).json(book)
    }catch(error){
        return res.status(404).json({message:error})
    }
});

// Get by author
public_users.get('/author/:author', async (req, res) => {
    try {
      const author = req.params.author;
  
      const getBooksByAuthor = new Promise((resolve, reject) => {
        const results = [];
        for (let key in books) {
          if (books[key].author.toLowerCase().includes(author.toLowerCase())) {
            results.push(books[key]);
          }
        }
        if (results.length > 0) resolve(results);
        else reject("No books found for this author");
      });
  
      const bookList = await getBooksByAuthor;
      return res.status(200).json(bookList);
    } catch (err) {
      return res.status(404).json({ message: err });
    }
  });

// Get by title
public_users.get('/title/:title', async (req, res) => {
    try {
      const title = req.params.title;
  
      const getBooksByTitle = new Promise((resolve, reject) => {
        const results = [];
        for (let key in books) {
          if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
            results.push(books[key]);
          }
        }
        if (results.length > 0) resolve(results);
        else reject("No books found with that title");
      });
  
      const bookList = await getBooksByTitle;
      return res.status(200).json(bookList);
    } catch (err) {
      return res.status(404).json({ message: err });
    }
  });

// Get reviews
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
