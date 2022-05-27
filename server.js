/** @format */

const db = require("./db.js");
const express = require("express");
const app = express();
const s3 = require("./s3");
const { uploader } = require("./upload");
const bucketurl = `https://magicplace.s3.amazonaws.com/`;

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use(express.static("./public"));

app.use(express.json());

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("req.body: ", req.body);
    console.log("req.file: ", req.file);
    const url = bucketurl + req.file.filename;
    console.log("constructed url ", url);

    db.insertImage({
        url,
        username: req.body.username,
        title: req.body.title,
        description: req.body.description,
    }).then(result => {
        res.json(result.rows);
        console.log("db res: ", result.rows);
    });
});

app.get("/images", (req, res) => {
    console.log("/images filter: ", req.query.filter);

    db.getAllImages(req.query.filter)
        .then(result => {
            console.log("getAllImages-Result: ", result);
            res.json(result.rows);
        })
        .catch(err => {
            console.log("getAllImages error", err);
            res.sendStatus(500);
        });
});

app.get("/image/:id", (req, res) => {
    let id = req.params.id;
    req.query.filter = req.query.filter ? req.query.filter : "";
    console.log("tried to get: ", id);

    if (!id || !Number(id) || !Number.isInteger(Number(id))) return res.json({});

    db.getImage(id, req.query.filter).then(result => {
        if (result.rows.length > 0) res.json(result.rows[0]);
        else res.json({});
    });
});

app.get("/images/:offset", (req, res) => {
    let offset = req.params.offset;
    console.log("tried to get: ", offset);

    if (!offset || !Number(offset) || !Number.isInteger(Number(offset))) return res.json([]);

    req.query.filter = req.query.filter ? req.query.filter : "";

    db.getImagePage(offset, req.query.filter).then(result => {
        if (result.rows.length > 0) res.json(result.rows);
        else res.json([]);
    });
});

app.get("/comments/:imageId", (req, res) => {
    let id = req.params.imageId;
    console.log("tried to get comment: ", id);

    if (!id || !Number(id) || !Number.isInteger(Number(id))) return res.json({ status: "Not a valid id" });

    db.getImageComments(id)
        .then(result => {
            if (result.rows.length > 0) res.json(result.rows);
            else res.status(404).send("no images found in this range");
        })
        .catch(err => {
            console.log("getImageComments error", err);
            res.sendStatus(500);
        });
});

app.post("/comment", (req, res) => {
    console.log("comment post json? :", req.body);
    let imageId = req.body.imageId;
    let text = req.body.text;
    let username = req.body.username;
    db.insertComment({ imageId, username, text })
        .then(result => {
            console.log("insertComment-Result: ", result);
            res.json(result.rows);
        })
        .catch(err => {
            console.log("insertComment error", err);
            res.sendStatus(500);
        });
});

app.get("*", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.listen(8080, () => console.log(`I'm listening.`));
