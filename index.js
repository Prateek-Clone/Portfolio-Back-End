const express = require("express");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.set("strictQuery", false);
const messageSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: String,
    date: String,
    time: String,
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Business_Email,
    pass: process.env.Business_Password,
  },
});

// Post Message Route
app.post("/sendmessage", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const currentDate = new Date();
    const timeZone = "Asia/Kolkata";
    const formattedDate = moment(currentDate)
      .tz(timeZone)
      .format("DD MMM YYYY");
    const formattedTime = moment(currentDate).tz(timeZone).format("h:mm A");
    const dayOfWeek = moment(currentDate).tz(timeZone).format("dddd");

    const newMessage = new MessageModel({
      name,
      email,
      message,
      date: `${formattedDate}, ${dayOfWeek}`,
      time: formattedTime,
    });
    await newMessage.save();

    // Notification to Business Email
    const BusinessNotification = {
      from: process.env.Business_Email,
      to: process.env.Primary_Email,
      subject: "✨ New Portfolio Message",
      html: `        
        <div
      style="
        font-family: Verdana, Geneva, Tahoma, sans-serif;
        border-radius: 10px;
        box-shadow: orange 0px 50px 100px -20px, orange 0px 30px 60px -30px,
          orange 0px -2px 6px 0px inset;
        backdrop-filter: blur(4px);
        padding: 1px 20px 20px;
        color: rgb(255, 255, 255);
        background-color: rgba(1, 1, 1, 0.763);
        font-size: medium;
      "
    >
      <p>Name : ${name}</p>
      <p>Email : ${email}</p>
      <p>Message : ${message}</p>
      <p>Date : ${formattedDate}, ${dayOfWeek}</p>
      <p>Time : ${formattedTime}</p>      
      <a
        href="https://prateekshuklaps0.github.io"
        style="
          font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande',
            'Lucida Sans', Arial, sans-serif;
          text-decoration: none;
          color: orange;
        "
      >
        Prateek Shukla
      </a>
    </div>
      `,
    };
    transporter.sendMail(BusinessNotification, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went Wrong!" });
      }
    });

    // Notification to User Email
    const UserNotification = {
      from: process.env.Business_Email,
      to: email,
      subject: "✨ Your Message Has Been Received.",
      html: `
      <div
      style="
        font-family: Verdana, Geneva, Tahoma, sans-serif;
        border-radius: 10px;
        box-shadow: orange 0px 50px 100px -20px, orange 0px 30px 60px -30px,
          orange 0px -2px 6px 0px inset;
        backdrop-filter: blur(4px);
        padding: 1px 20px 20px;
        color: rgb(255, 255, 255);
        background-color: rgba(1, 1, 1, 0.763);
        font-size: medium;
      "
    >
      <p>
        Hello! <span style="color: orange; font-size: larger">${name}</span>,
      </p>
      <p>
        Thank you for reaching out to me! Your message has been successfully
        received. 🌟
      </p>
      <p>
        Please rest assured that I value your input and I'm looking forward to
        responding as soon as possible. I genuinely appreciate your patience.
      </p>
      <p>
        In the meantime, if you have any urgent inquiries or if there's anything
        else you'd like to discuss, please don't hesitate to reach out. Your
        thoughts and questions are important to me.
      </p>
      <p>Wishing you a wonderful day ahead!</p>
      <a
        href="https://prateekshuklaps0.github.io"
        style="
          font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande',
            'Lucida Sans', Arial, sans-serif;
          text-decoration: none;
          font-size: larger;
          color: orange;
        "
      >
        Prateek Shukla
      </a>
    </div>
      `,
    };
    transporter.sendMail(UserNotification, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Something went Wrong!" });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(201).json({ message: "Message Sent Successfully!" });
      }
    });
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
