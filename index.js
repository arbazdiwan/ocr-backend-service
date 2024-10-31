import express from "express";

// setup express server
const app = express();
const port = process.env.PORT || 8080;

// setup routes
app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});

app.get("/:id", (req, res) => {
  res.status(200).send(`Hello ${req.params.id}`);
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
