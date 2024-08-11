import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "books",
    password: "0824",
    port: 5432,
});
db.connect();

const app = express();
const port = 3000;
const BOOK_SEARCH_API = "https://openlibrary.org/search.json?q=the+lord+of+the+rings";
const BOOK_COVER_API = "https://covers.openlibrary.org/b/isbn/0385472579-S.jpg";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let books = [];

// Get the list of books
async function getBooks() {
    try {
        const result = await db.query("SELECT * FROM books ORDER BY posted DESC");
        return result.rows;
    } catch (err) {
        console.log(`Error retrieving data.\nMessage: ${err}`);
    }
}

// Get the list of sorted books
async function getSortedBooks(sortOption) {
    
    try {
        const result = await db.query(`SELECT * FROM books ORDER BY ${sortOption}`);
        return result.rows;
    } catch (err) {
        console.log(`Error retrieving data.\nMessage: ${err}`);
    }
}

app.get("/", async (req, res) => {
    books = await getBooks();
    res.render("index.ejs", {
        booksList: books
    }
    );
});

app.get("/add", (req, res) => {
    res.render("addBook.ejs");
});

app.get("/edit/:bookId", async (req, res) => {
    books = await getBooks();
    let bookId = req.params.bookId;

    let bookToUpdate = books.filter((book) => book.book_id === parseInt(bookId));
    res.render("editBook.ejs", {
        book: bookToUpdate[0]
    });
});

// Add a new review
app.post("/add", async (req, res) => {
    var {title, author, isbn, review, rating} = req.body;
    rating = parseInt(rating);

    try {
        await db.query("INSERT INTO books(title, author, isbn, review, rating) \
        VALUES ($1, $2, $3, $4, $5)", [title, author, isbn, review, rating]);
        console.log("New review added");
        res.redirect("/");
    } catch (err) {
        console.log(`Error could not add review.\nMessage: ${err}`);
    }
});

// Update edit made to review
app.post("/updated", async (req, res) => {
    let {id, title, author, isbn, review, rating} = req.body;

    // Update existing entry
    try {
        await db.query("UPDATE books\
            SET book_id = $1, title = $2, author = $3, isbn = $4, review = $5, rating = $6\
            WHERE book_id = $1", [id, title, author, isbn, review, rating]);
            console.log(`Post ${id} updated.`);
            res.redirect("/");
    } catch (err) {
        console.log(`Post could not be updated.\nMessage: ${err}`);
    }
});

// Delete a post
app.post("/delete", async (req, res) => {
    let id = req.body.id;

    try {
        await db.query("DELETE FROM books\
            WHERE book_id = $1", [id]);
            console.log("Post Deleted");
    } catch (err) {
        console.log(`Post could not be deleted.\nMessage: ${err}`);
    }
    res.redirect("/");
});

// Sorting post
app.post("/sort", async (req, res) => {
    const sortOption = req.body.sort;
    books = await getSortedBooks(sortOption);
    res.render("index.ejs", {
        booksList: books
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});