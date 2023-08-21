const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment");
const cors = require("cors");
require("dotenv").config();

const app = express();

mongoose.set("strictQuery", false);
app.use(cors());
app.use(express.json());

const messageSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: String,
    date: String,
    time: String,
    day: String,
  },
  { versionKey: false }
);

const MessageModel = mongoose.model("PortfolioMessages", messageSchema);

// Home Route
app.get("/", async (req, res) => {
  try {
    res.status(201).json({ message: "You Shouldn't Be Here!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went Wrong!" });
  }
});

// Post Message Route
app.post("/sendmessage", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const currentDate = new Date();
    const formattedDate = moment(currentDate).format("DD MMM YYYY");
    const formattedTime = moment(currentDate).format("h:mm A");
    const dayOfWeek = moment(currentDate).format("dddd");

    const newMessage = new MessageModel({
      name,
      email,
      message,
      date: formattedDate,
      time: formattedTime,
      day: dayOfWeek,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message Sent Successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went Wrong!" });
  }
});

app.listen(8080, async () => {
  try {
    await mongoose.connect(process.env.DB_Url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected and Server is running on port : 8080`);
  } catch (error) {
    console.log("Connection Error");
  }
});
