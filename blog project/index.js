import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

// Variables for blog

let post = {};
let entryNum = 0;
let postList = [];

function deleteEntry(num) {
    postList.filter(entry => entry.entryNum !== num);
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res, next) => {
    res.render("index.ejs", {
        date: post.date,
        blogPost: post.blogPost,
        entryNum: entryNum,
        list: postList
    });
});

app.get("/newEntry", (req, res, next) => {
    res.render("newEntry.ejs");
});

app.get("/update/:postNum", (req, res, next) => {
    let postNum = parseInt(req.params.postNum);
    // Find the matching postNum to send over to update.ejs
    let entryToUpdate = postList.filter((entry) => entry.entryNum === postNum);

    res.render("update.ejs", {
        entryNum: entryToUpdate[0].entryNum,
        date: entryToUpdate[0].date,
        blogPost: entryToUpdate[0].blogPost
    });
});

app.post("/updated", (req, res, next) => {
    let updatedEntry = req.body;
    updatedEntry.entryNum = parseInt(updatedEntry.entryNum);
    
    // Note: foreach loop would not work because it only changes the local reference versus the actual postList array elements
    for (let i = 0; i < postList.length; i++)
    {
        if (postList[i].entryNum === updatedEntry.entryNum)
        {
            postList[i] = updatedEntry;
            console.log(`Post #${updatedEntry.entryNum} updated`);
        }
    }
    res.redirect("/");
});

app.post("/delete", (req, res, next) => {
    let updatedEntry = req.body;
    updatedEntry.entryNum = parseInt(updatedEntry.entryNum);

    // Note: foreach loop would not work because it only changes the local reference versus the actual postList array elements
    for (let i = 0; i < postList.length; i++)
    {
        if (postList[i].entryNum === updatedEntry.entryNum)
        {
            //delete postList[i]; // Leaves an empty instead of resizing the array
            postList.splice(i, 1);
        }
    }
    
    res.redirect("/");
});

app.post("/add", (req, res, next) => {
    post.date = req.body["date"];
    post.blogPost = req.body["blogPost"];
    entryNum++;
    post.entryNum = entryNum;
    postList.push(post);

    post = {};
    
    res.redirect("/");
});

app.listen(port, () =>{
    console.log(`Listening on port ${port}`);
});