require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

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

//////////////////
/// RETURN BASIC INFO
//////////////////
app.get("/info", (req, res) => {
  const date = new Date();
  Contact.countDocuments({}, function (err, count) {
    console.log("Number of contacts: ", count);

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`Phonebook has ${count} contacts \n ${date}`);
  });
});

//////////////////
/// RETURN ALL CONTACTS
//////////////////
app.get("/api/persons", (req, res, next) => {
  Contact.find({})
    .then((result) => {
      console.log("db reading ready", result);
      res.json(result);
    })
    .catch((error) => next(error));
});

//////////////////
/// RETURN SINGLE CONTACT
//////////////////
app.get("/api/persons/:id", (request, response, next) => {
  Contact.findById(request.params.id)
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});

//////////////////
/// DELETE CONTACT
//////////////////
app.delete("/api/persons/:id", (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));

  //contacts = contacts.filter((c) => c.id !== id);
});

//////////////////
/// UPDATE CONTACT DATA
//////////////////
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const contact = {
    name: body.name,
    number: body.number,
  };

  Contact.findByIdAndUpdate(request.params.id, contact, { new: true })
    .then((updatedContact) => {
      response.json(updatedContact);
    })
    .catch((error) => next(error));
});

//////////////////
/// ADD NEW CONTACT
//////////////////
app.post("/api/persons", (request, response) => {
  const body = request.body;

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

  const contact = new Contact({
    name: body.name,
    number: body.number,
  });

  contact.save().then((result) => {
    console.log(`added ${contact.name} number ${contact.number} to phonebook`);
    response.json(contact);
  });
  contacts = contacts.concat(contact);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint);

//////////////////
/// ERROR HANDLER
//////////////////
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler);

//////////////////
/// LISTENING PORT
//////////////////
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
