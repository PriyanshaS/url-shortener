import { customAlphabet } from "nanoid";
import { pool } from "../db.js";
import Sqids from "sqids";
import { getLongUrl } from "./redirectCache.js";
import { json } from "express";

const nano = customAlphabet(
  process.env.ALPHABET_STRING,
  Number(process.env.SIZE),
);
const codeGenerator = () => nano();

export const postUrl = async (req, res) => {
  try {
    const longUrl = req.body.url;
    const validate = validateUrl(longUrl);
    if (!longUrl || !validate.ok) {
      return res.status(400).json({
        error: validate.error,
      });
    }
    const expiresInDays = req.body?.expires_at || process.env.LINK_TTL_DAYS;
    for (let attempt = 0; attempt < 10; attempt++) {
      const { rows } = await pool.query(
        `INSERT INTO urls (code, long_url , expires_at) VALUES ($1, $2 , NOW() + make_interval(days => $3::int))
         ON CONFLICT (code) DO NOTHING
         RETURNING code , expires_at`,
        [codeGenerator(), longUrl, expiresInDays],
      );
      if (rows.length) {
        var url = `${process.env.BASE_URL}/${rows[0].code}`;
        var expire = rows[0].expires_at;
        return res.status(201).json({ url: url, expires_at: expire });
      }
    }
    return res.status(503).json({ error: "Could not generate a unique code" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const getRedirectUrl = async (req, res) => {
  try {
    const code = req.params.code;
    const longUrl = await getLongUrl(code);
    if (!longUrl) return res.status(404).send("Not found");
    res.set("Cache-Control", "public, max-age=300");
    res.redirect(302, longUrl);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const getUrl = (req, res) => {
  console.log("Request received");
  res.send("Hello World!");
};

function toBase62(num) {
  let n = BigInt(num);
  const sqids = new Sqids({ minLength: 6 });
  return sqids.encode([Number(n)]);
}

function validateUrl(url) {
  try {
    const MAX_LENGTH = 2048;
    if (typeof url !== "string") return { ok: false, error: "URL is required" };
    const parsedUrl = new URL(url);
    if (parsedUrl.length > MAX_LENGTH)
      return { ok: false, error: "URL is too long" };
    if (!["http:", "https:"].includes(parsedUrl.protocol))
      return { ok: false, error: "Only http and https URLs are allowed" };
    return { ok: true, url: url };
  } catch (err) {
    return { ok: false, error: err };
  }
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
    return res.status(500).json({ error: e });
  }
};
