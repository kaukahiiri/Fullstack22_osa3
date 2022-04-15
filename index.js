require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const Contact = require("./models/contact");

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(morgan("tiny"));

let contacts = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];
////////////////////
///  ROUTES      ///
////////////////////

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.get("/info", (req, res) => {
  const date = new Date();
  console.log(contacts.length);
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(`Phonebook has ${contacts.length} contacts \n ${date}`);
});

app.get("/api/persons", (req, res) => {
  Contact.find({}).then((result) => {
    console.log("db read ready");
    mongoose.connection.close();
  });
  res.json(result);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const contact = contacts.find((c) => {
    return c.id === id;
  });
  if (contact) {
    response.json(contact);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  contacts = contacts.filter((c) => c.id !== id);

  response.status(204).end();
});

/// Generate id for a new note
const generateId = () => {
  return Math.floor(Math.random() * 10000000);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  console.log(body);
  console.log(body.number);

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  const unique = contacts.find((c) => c.name === body.name);
  console.log(unique);
  if (unique) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }
  const contact = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  contacts = contacts.concat(contact);

  response.json(contact);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
