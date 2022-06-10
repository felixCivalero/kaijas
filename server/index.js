const express = require("express");
const app = express();
const mysql = require("mysql2");
// Allowing to send from front-end to my own API
const cors = require("cors");
const nodemailer = require("nodemailer");

// making request from frontend to backend
app.use(cors());
//Parsing the json when we send from frontend to backend
app.use(express.json());

const db = mysql.createConnection({
  host: "192.168.1.72",
  user: "root",
  port: 3308,
  password: "",
  database: "kaijas",
});

const transporter = nodemailer.createTransport({
  host: "send.one.com",
  port: 587,
  auth: {
    user: "do-not-reply@kaijasalong.com",
    pass: "Tiger2005",
  },
});

/*-----------------LOGIN USER INFO-----------*/

// app.get("/getLoginInfo", (req, res) => {
//   db.query("select email, band_PIN FROM artists", (err, result) => {
//     if (err) {
//       console.log("Error getting login-info" + err);
//     } else {
//       res.send(result);
//     }
//   });
// });

/*-----------------UPLOAD CONCERT TO SERVER-----------*/
app.post("/uploadArtist", (req, res) => {
  const name = req.body.name;
  const genre = req.body.genre;
  const price = req.body.price;
  const date = req.body.date;
  const time = req.body.time;
  const desc = req.body.desc;
  const options = {
    from: "do-not-reply@kaijasalong.com",
    to: "artist@kaijasalong.com",
    subject: `Koncert uppladdad! `,
    html: `<h1>${name} har precis lagt upp en koncert!</h1>
    <h3>Så här ser det ut:</h3>
    <ul>
      <li>${name}</li>
      <li><strong>${genre}</strong></li>
      <li><strong>${date} ${time}</strong></li>
      <li><strong>${price}</strong></li>
    </ul>
    <p>${desc}</p>
<p>---------------------------</p>
    <p>För att redigera: Logga in på kaijasalong.com/phpmyadmin</p>
    <p>Vsg brysh,<br>Felix</p>
    `,
  };

  db.query(
    "INSERT INTO concerts (artists_name, artists_genre, artists_price, artists_date, artists_time, artists_desc, max_guests) VALUES (?,?,?,?,?,?,?)",
    [name, genre, price, date, time, desc, 25],
    (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send("Values Inserted");
        transporter.sendMail(options, function (err, info) {
          if (err) throw err;
        });
      }
    }
  );
});

/*-----------------GET CONCERT-----------*/

app.get("/getConcert", (req, res) => {
  let currDate = new Date();
  let date =
    currDate.getFullYear() +
    "-" +
    ("0" + (currDate.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + currDate.getDate()).slice(-2);
  db.query(
    `select * from concerts where artists_date >= '${date}' ORDER BY artists_date`,
    (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send(result);
      }
    }
  );
});

/*-----------------UPLOAD BAND REGUEST TO SERVER AND EMAIL artist@kaijasalong.com-----------*/

app.post("/uploadBand", (req, res) => {
  const bandName = req.body.bandName;
  const bandContact = req.body.bandContact;
  const bandMail = req.body.bandMail;
  const bandTel = req.body.bandTel;
  const bandGenre = req.body.bandGenre;
  const bandLink = req.body.bandLink;
  const bandDesc = req.body.bandDesc;
  const bandPIN = Math.floor(1000 + Math.random() * 9000);

  const options = {
    from: "do-not-reply@kaijasalong.com",
    to: "artist@kaijasalong.com",
    subject: `Ny förfrågan: ${bandName}`,
    html: `<h1>${bandName} vill uppträda på Kaijas!</h1>
    <h3>Info om bandet</h3>
    <ul>
      <li>Kontaktperson: <strong>${bandName}</strong></li>
      <li>Mail: <strong>${bandMail}</strong></li>
      <li>PIN-kod: <strong>${bandPIN}</strong></li>
      <li>Tel: <strong>${bandTel}</strong></li>
      <li>Genre: <strong>${bandGenre}</strong></li>
      <li>Länk: ${bandLink}</li>
    </ul>
    <h4>Beskrivning</h4>
    <p>${bandDesc}</p>

    <p>Vsg brysh,<br>Felix</p>
    `,
  };

  db.query(
    "INSERT INTO artists (band_name, contact_name, email, phone, genre, artists_link, band_desc, band_PIN) VALUES (?,?,?,?,?,?,?,?)",
    [
      bandName,
      bandContact,
      bandMail,
      bandTel,
      bandGenre,
      bandLink,
      bandDesc,
      bandPIN,
    ],
    (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send("Values Inserted");

        transporter.sendMail(options, function (err, info) {
          if (err) {
            throw err;
          }
        });
      }
    }
  );
});

/*-----------------UPLOAD vänner TO SERVER and EMAIL confimration-----------*/

app.post("/uploadCostumer", (req, res) => {
  const costumerName = req.body.costumerName;
  const costumerMail = req.body.costumerMail;
  const costumerPhone = req.body.costumerPhone;
  const costumerInterest = req.body.costumerInterest;

  const options = {
    from: "do-not-reply@kaijasalong.com",
    to: costumerMail,
    subject: `Kaijas <3 ${costumerName.split(" ")[0]}`,
    html: `<h1>Du har registrerats som en av Kaijas vänner</h1>
    <h3>Nu är du först med att få nys om våra nyheter</h3>
   
    <p>Som Sveriges minsta live-scen blir våra intima konserter snabbt utsålda. Som Kaijas-vän får du information om våra spelningar och events före de publiceras offentligt. Du får också ta del av specialerbjudanden och bättre priser!</p>

    <p>Vi hörs snart igen!<br>Felix och Saga på Kaijas</p>
    `,
  };

  db.query(
    "INSERT INTO vanner (costumer_name, costumer_email, costumer_phone, costumer_interest) VALUES (?,?,?,?)",
    [costumerName, costumerMail, costumerPhone, costumerInterest],
    (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send("Values Inserted");

        transporter.sendMail(options, function (err, info) {
          if (err) {
            throw err;
          }
        });
      }
    }
  );
});

/*-------------------BOOKINGS------------*/
app.post("/uploadBooking", (req, res) => {
  const bookingName = req.body.guestsName;
  const bookingMail = req.body.guestsMail;
  const bookingTel = req.body.guestsTel;
  const eat = req.body.eat;
  const bookingAmount = req.body.amount;
  const eventId = req.body.bookingEventId;
  const eventName = req.body.bookingEventName;
  const eventDate = req.body.bookingEventDate;
  const eventTime = req.body.bookingEventTime;
  const totalPrice = req.body.totalPrice;
  const eatHtml =
    req.body.eat === "Ja"
      ? `Eftersom ni vill äta rekommenderar vi att ni kommer senast 1 timme/45 minuter före kl${eventTime} för att vi ska kunna få ut er beställning i tid till konserten.`
      : "Kom gärna ett par minuter före konsertens start så ni hinner beställa dryck och snacks i lugn och ro.";

  const options = {
    from: "do-not-reply@kaijasalong.com",
    to: bookingMail,
    subject: `Kaijas <> ${eventName}`,
    html: `<h1>Tack för din bokning ${bookingName.split(" ")[0]}!</h1>
    <h3>Välkommen till svergies minsta live-scen!</h3>
    <ul>
      <li>Artist: <strong>${eventName}</strong></li>
      <li>Datum: <strong>${eventDate}</strong></li>
      <li>Tid: <strong>${eventTime}</strong></li>
      <li>Adress: <strong>Storgatan 44, Stockholm</strong></li>
    </ul>
    <p>Totalt biljettpris: ${totalPrice} kr</p>
    <p>${eatHtml}</p>
    <p>Vi ses snart!</p>
    <p>Med vänliga hälsningar,<br>Saga och Felix på Kaijas</p>

    <p>Har du frågor inför besöket? Ring <a href="tel:073-4233504">073-423 35 04</a> eller maila till <a href="mailto:info@kaijasalong.com">info@kaijasalong.com</a> så hjälper vi dig!</p>
    <small>Avbokning ska ske minst 48 timmar innan konsertens datum. Avbkokning senare än 48 timmar, eller eventuell no-show, debiteras med det fulla biljettpriset.</small>
    `,
  };

  db.query(
    "INSERT INTO bookings (booking_name, booking_mail, booking_tel, booking_eat, booking_amount, booking_event_id) VALUES (?,?,?,?,?,?)",
    [bookingName, bookingMail, bookingTel, eat, bookingAmount, eventId],
    (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send("Values Inserted");

        transporter.sendMail(options, function (err, info) {
          if (err) {
            throw err;
          }
        });
      }
    }
  );
});

app.post("/updateConcert", (req, res) => {
  const id = req.body.id;
  const availability = req.body.capacity;

  db.query(
    `UPDATE concerts SET max_guests = '${availability}' WHERE concerts.artists_id = '${id}';`,
    (err, result) => {
      if (err) {
        throw err;
      } else {
        res.send("Values Inserted");
      }
    }
  );
});

app.listen(3001, () => {
  console.log("Your server is running on server 3001");
});
