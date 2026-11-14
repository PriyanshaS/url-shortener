import { pool } from "./db.js";

// await pool.query(`
//   CREATE TABLE IF NOT EXISTS urls (
//     id          BIGSERIAL PRIMARY KEY,
//     code        VARCHAR(12) NOT NULL UNIQUE,
//     long_url    TEXT NOT NULL,
//     created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
//     expires_at  TIMESTAMPTZ,
//     click_count BIGINT NOT NULL DEFAULT 0,
//   )
// `);
// await pool.query(`select * from urls`).then((e) => console.log(e));
// await pool.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS urls_expires_at_idx
//   ON urls (expires_at) WHERE expires_at IS NOT NULL`);

// await pool
//   .query(`SELECT indexname FROM pg_indexes WHERE tablename = 'urls'`)
//   .then((e) => console.log(e));

// await pool
//   .query(
//     ` SELECT * FROM urls WHERE expires_at < now()
//     ORDER BY expires_at `,
//   )
//   .then((e) => console.log(e));
// await pool.query(`CREATE EXTENSION pg_cron;`);
// await pool.query(`SELECT * FROM cron.job;`).then((e) => console.log(e));
// await pool
//   .query(`SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;`)
//   .then((e) => console.log(e));

// await pool.query(`SELECT cron.schedule(
//   'delete-expired-urls',
//   '30 21 * * *',
//   $$DELETE FROM urls WHERE expires_at < now()$$
// );`);
// await pool
//   .query(`SELECT jobid, schedule, command, active FROM cron.job;`)
//   .then((e) => console.log(e));
console.log("Table ready");
await pool.end();
