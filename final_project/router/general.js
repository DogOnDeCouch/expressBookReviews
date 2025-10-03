const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if (username && password) { 
    if (!isValid(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    resolve(books);
  });
  
  getBooks.then((books) => {
    res.send(JSON.stringify(books, null, 4));
  }).catch((error) => {
    res.status(500).json({ message: "Error retrieving book list." });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn;
  try {
      const book = await Promise.resolve(books[isbn]);
      
      if (book) {
        return res.status(200).json(book);
      } else {
        return res.status(404).json({ message: "Book not found." });
      }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book by ISBN." });
  }
});
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  const author = req.params.author;
  try {
    const getBooksByAuthor = async (auth) => {
      const bookKeys = Object.keys(books);
      const matchingBooks = [];
      for (const key of bookKeys) {
        if (books[key].author === auth) {
          matchingBooks.push(books[key]);
        }
      }
      return matchingBooks;
    };

    const matchingBooks = await getBooksByAuthor(author);

    if (matchingBooks.length > 0) {
      return res.status(200).json({ booksbyauthor: matchingBooks });
    } else {
      return res.status(404).json({ message: "No books by that Author found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by Author." });
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  const title = req.params.title;
  try {
    const getBooksByTitle = async (bookTitle) => {
      const bookKeys = Object.keys(books);
      const matchingBooks = [];
      for (const key of bookKeys) {
        if (books[key].title === bookTitle) {
          matchingBooks.push(books[key]);
        }
      }
      return matchingBooks;
    };

    const matchingBooks = await getBooksByTitle(title);

    if (matchingBooks.length > 0) {
      return res.status(200).json({ booksbytitle: matchingBooks });
    } else {
      return res.status(404).json({ message: "No books with that title found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book by title." });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn]; 

  if (book) {
    // Book exists, send the reviews
    return res.status(200).json(book.reviews);
  } else {
    // Book not found, send error message
    return res.status(404).json({ message: "Book not found." });
  }
});

module.exports.general = public_users;
