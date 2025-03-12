const express = require("express");
const connectDB = require("./mongodb");
const router = require("./routes");
const cors = require("cors")
require("dotenv").config();

const app = express();

const corsOptions = {
    origin: ["http://localhost:5173"]
};

app.use(express.json());
app.use(cors(corsOptions));

connectDB();

app.use(router);

app.listen(process.env.PORT || 4000)