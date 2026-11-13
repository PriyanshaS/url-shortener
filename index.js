import express from "express";
import url from "./src/routes/urls.js";
const app = express();

const port = 8000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/url", url);

app.listen(port, () => {
  console.log("Server running on port", port);
});
