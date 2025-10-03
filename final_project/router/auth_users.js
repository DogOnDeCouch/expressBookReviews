const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean

  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      username: username,
      password: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = accessToken;
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.body.review;
  const username = req.user.username;

  if (!reviewText) {
    return res.status(400).json({ message: "Review text is required." });
  }

  if (books[isbn]) {
    let book = books[isbn];
    book.reviews[username] = reviewText;
    return res.status(200).json({ message: "Review successfully added/updated.", reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Book with the specified ISBN not found." });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (books[isbn]) {
    if (books[isbn].reviews[username]) {
      // User has a review for this book, so delete it
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review successfully deleted." });
    } else {
      // User does not have a review
      return res.status(404).json({ message: "You have not posted a review for this book." });
    }
  } else {
    // Book not found
    return res.status(404).json({ message: "Book with the specified ISBN not found." });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
