import colors from "colors";

const logger = (req, res, next) => {
  const methodColors = {
    GET: "green",
    POST: "blue",
    PUT: "yellow",
    DELETE: "red",
  };

  console.log(
    `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`[
      methodColors[req.method]
    ],
  );
  next();
};

export default logger;
