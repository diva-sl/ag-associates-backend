import "./config/env.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import passport from "./config/passport.js";

connectDB();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://agandassociates.org", // your Hostinger domain
      "https://www.agandassociates.org",
    ],
    credentials: true,
  }),
);

app.use(passport.initialize());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("AG Associates API Running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
