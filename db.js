/** @format */

const spicedPg = require("spiced-pg");
const db = spicedPg(process.env.DATABASE_URL || `postgres:spiced:spiced@localhost:5432/imageboard`);

const doInit = true;
if (doInit)
    db.query(
        `drop table if exists comments cascade;
        CREATE TABLE comments (
        id          SERIAL PRIMARY KEY,
        image_id     INTEGER NOT NULL REFERENCES images(id), //TODO: on delete cascade adden 
        text   TEXT NOT NULL CHECK (text != ''),
        username TEXT NOT NULL CHECK (username != ''),
        x   TEXT,
        y   TEXT,
        color TEXT,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
    );

exports.insertComment = ({ imageId, text, username, x, y, color }) => {
    return db.query(
        `INSERT INTO comments (image_id, username,text,x,y,color)
        VALUES ($1, $2, $3,$4,$5,$6) returning *`,
        [imageId, username, text, x, y, color]
    );
};

exports.getImageComments = imageId => {
    return db.query(`select * from comments where image_id = $1 order by id asc`, [imageId]);
};

exports.getImage = (imageId, filter = "") => {
    return db.query(
        `select *,(
  SELECT id FROM images
  WHERE title LIKE '%' || $2 || '%' and id > $1
  ORDER BY id ASC
  LIMIT 1
) AS "idNext" ,(
  SELECT id FROM images
  WHERE title LIKE '%' || $2 || '%' and id < $1
  ORDER BY id DESC
  LIMIT 1
) AS "idBefore" from images where id=$1`,
        [imageId, filter]
    );
};

exports.getAllImages = filter => {
    console.log(`Filter in getAllImages:"` + filter + `"`);
    return db.query(
        `SELECT url, title, id,(
  SELECT id FROM images
  WHERE title LIKE '%' || $1 || '%'
  ORDER BY id ASC
  LIMIT 1
) AS "lowestId"  from images where title LIKE '%' || $1 || '%' ORDER BY id DESC
LIMIT 5;`,
        [filter]
    );
};

exports.getImagePage = (offset, filter) => {
    return db.query(
        `SELECT url, title, id, (
  SELECT id FROM images
  WHERE id < $1
and title LIKE '%' || $2 || '%'
  ORDER BY id ASC
  LIMIT 1
) AS "lowestId" FROM images
WHERE id < $1
and title LIKE '%' || $2 || '%'
ORDER BY id DESC
LIMIT 3;`,
        [offset, filter]
    );
};

exports.insertImage = ({ url, username, title, description }) => {
    return db.query(
        `INSERT INTO images (url, username,title,description)
        VALUES ($1, $2, $3,$4) returning *`,
        [url, username, title, description]
    );
};
