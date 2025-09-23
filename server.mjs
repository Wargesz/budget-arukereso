import express from "express";
import { Search } from "./ImageScraperService.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("static"));

app.get("/", (_, res) => {
    res.render("search");
})

app.get("/results", async (req, res) => {
    res.render("results", {
        results: [await Search(req.query.searchword)]
    })
})

app.listen(PORT, () => {
    console.log(`running on: http://localhost:${PORT}`);
})
