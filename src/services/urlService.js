import { customAlphabet } from "nanoid";
import { pool } from "../db.js";
import Sqids from "sqids";

const nano = customAlphabet(
  process.env.ALPHABET_STRING,
  Number(process.env.SIZE),
);
const codeGenerator = () => nano();
export const postUrl = async (req, res) => {
  try {
    const longUrl = req.body.url;
    const expiresAt = req.body?.expires_at;
    for (let attempt = 0; attempt < 10; attempt++) {
      const { rows } = await pool.query(
        `INSERT INTO urls (code, long_url , expires_at) VALUES ($1, $2 , $3)
         ON CONFLICT (code) DO NOTHING
         RETURNING code , expires_at`,
        [codeGenerator(), longUrl, expiresAt],
      );
      if (rows.length) {
        var url = `${process.env.BASE_URL}/${rows[0].code}`;
        var expire = rows[0].expires_at;
        return res.status(201).json({ url: url, expires_at: expire });
      }
    }
    return res.status(503).json({ error: "Could not generate a unique code" });
  } catch (error) {
    throw error;
  }
};

export const getRedirectUrl = async (req, res) => {
  try {
    const code = req.params.code;
    const { rows } = await pool.query(
      `UPDATE urls SET click_count = click_count + 1 where code = $1 and (expires_at IS NULL OR expires_at > NOW()) returning long_url`,
      [code],
    );
    const longUrl = rows[0].long_url;
    res.redirect(302, longUrl);
  } catch (err) {
    throw err;
  }
};

export const getUrl = (req, res) => {
  console.log("Request received");
  res.send("Hello World!");
};

function toBase62(num) {
  let n = BigInt(num);
  let code = "";
  const sqids = new Sqids({ minLength: 6 });

  //   while (n > 0n) {
  //     code = process.env.ALPHABET_STRING[Number(n % 62n)] + code;
  //     n = n / 62n;
  //   }
  return sqids.encode([Number(n)]);
}

export const postUrlCounter = async (req, res) => {
  try {
    const longUrl = req.body.url;
    const { rows } = await pool.query("SELECT nextval('urls_id_seq') AS id");
    const id = rows[0].id;

    const code = toBase62(id);

    await pool.query(
      "INSERT INTO urls (id, code, long_url) VALUES ($1, $2, $3)",
      [id, code, longUrl],
    );
    const url = `${process.env.BASE_URL}/${code}`;
    return res.status(201).json(url);
  } catch (e) {
    throw e;
  }
};
