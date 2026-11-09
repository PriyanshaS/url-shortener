import { nanoid, customAlphabet } from "nanoid";
import { pool } from "../db.js";

export const postUrl = async (req, res) => {
  try {
    const nanoid = customAlphabet(
      process.env.ALPHABET_STRING,
      process.env.SIZE,
    );
    const code = nanoid();
    const longUrl = req.body.url;

    const { rows } = await pool.query(
      `INSERT INTO urls (code, long_url) VALUES ($1, $2) RETURNING code`,
      [code, longUrl],
    );

    const url = `${process.env.BASE_URL}/${rows[0].code}`;
    return res.status(201).json(url);
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
    await pool.end();
    res.redirect(302, longUrl);
  } catch (err) {
    throw err;
  }
};

export const getUrl = (req, res) => {
  console.log("Request received");
  res.send("Hello World!");
};
