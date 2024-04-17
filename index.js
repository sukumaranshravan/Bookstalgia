import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"bookstalgia",
    password:"karuvaripp7",
    port:5432,
  });

db.connect();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/",async (req,res)=>{
    const result = await db.query("select * from booklist order by id desc")
    // console.log(result.rows)
    const books = result.rows
    let value = books[0].isbn
    // const API_URL = `https://covers.openlibrary.org/b/isbn/${value}-L.jpg`
    res.render("index.ejs",{items:books})
})
app.get("/new",(req,res)=>{
    res.render("add_book.ejs")
})

app.post("/add",async (req,res)=>{
    try{
        const name = req.body.title
        const creator = req.body.author
        const crux = req.body.gist
        const rate = req.body.rating
        const code = req.body.isbn
        await db.query("insert into booklist (title,author,gist,rating,isbn) values ($1,$2,$3,$4,$5)",[name,creator,crux,rate,code])
        res.redirect("/")
    }catch(err){
        console.log("Empty Fields")
        res.redirect("/")
    }
})

// this route is for the read more button, if we click on read more it will use this route
app.post("/details", async (req,res)=>{
    const  id = req.body.bookId
    const result = await db.query("select * from booklist where id = ($1)",[id])
    const books = result.rows
    let value = books[0].isbn
    const API_URL = `https://covers.openlibrary.org/b/isbn/${value}-L.jpg`
    // const response = await axios.get(API_URL)
    console.log(req.params.bookId)
    res.render("details.ejs",{items:books,cover:API_URL})
})

// this route is actually an alternative to the above route, here if a user click on the Image, it will work
app.get("/detail/:id", async (req,res)=>{
    const id = req.params.id
    const result = await db.query("select * from booklist where id = ($1)",[id])
    const books = result.rows
    let value = books[0].isbn
    const API_URL = `https://covers.openlibrary.org/b/isbn/${value}-L.jpg`
    res.render("details.ejs",{items:books,cover:API_URL})
})



app.post("/update", async (req,res)=>{
    const name = req.body.title
    const creator = req.body.author
    const crux = req.body.gist
    const rate = req.body.rating
    const code = req.body.isbn
    const id = req.body.id
    await db.query("update booklist set (title,author,gist,rating,isbn) = ($1,$2,$3,$4,$5) where id = ($6)",[name,creator,crux,rate,code,id])
    res.redirect("/")
})

app.post("/remove", async (req,res)=>{
    console.log(req.body.id)
    const id = req.body.id
    await db.query("delete from booklist where id = ($1)",[id])
    res.redirect("/")
})

app.listen(port,(req,res)=>{
    console.log(`Server is running successfully on port ${port}`)
})