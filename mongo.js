const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
let name = "";
let number = "";

const url = `mongodb+srv://kaukahiiri:${password}@cluster0.hlmzi.mongodb.net/myPBDatabase?retryWrites=true&w=majority`;
mongoose.connect(url);

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Contact = mongoose.model("Contact", contactSchema);

if (process.argv.length === 3) {
  Contact.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((contact) => {
      console.log(`${contact.name} ${contact.number}`);
    });
    mongoose.connection.close();
  });
} else {
  name = process.argv[3];
  number = process.argv[4];

  const contact = new Contact({
    name: name,
    number: number,
  });

  contact.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}
