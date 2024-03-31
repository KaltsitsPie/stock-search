import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import mongoose, { Mongoose, connect } from "mongoose";
import cors from "cors"
import router from "./routes/stocks.js";
// import { dirname } from "path";
// import { fileURLToPath } from "url";
const app = express();
// allows for rich objects and arrays to be encoded into the url encoded format
app.use(bodyParser.json({
    limit: "32mb",
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: "32mb",
    extended: true
}));
app.use(cors());

app.use("/stocks", router);

const finnhubKey = "cnarddhr01ql0f8afcf0cnarddhr01ql0f8afcfg";
const MONGO_URL = "mongodb+srv://Yanchen:do5Y9QM441xueofI@stocksearch3.luk9nug.mongodb.net/?retryWrites=true&w=majority&appName=StockSearch3";
const PORT = process.env.PORT || 5001;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
    } catch(err) {
        console.log("fail to connect mongodb.");
    }
};

connectDB();
mongoose.connection.on("open", () => {
    console.log("DB has been established successfully.");
});
mongoose.connection.on("error", (err) => {
    console.log("DB fail to established.", err.message);
});

app.listen(PORT, () => {
    console.log(`server run in port: ${PORT}`);
})


app.get('/search', async (req, res) => {

    const symbol = req.query.symbol;
    const apiUrl = `https://finnhub.io/api/v1/search?q=${symbol}&token=${finnhubKey}`;

    try {
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
