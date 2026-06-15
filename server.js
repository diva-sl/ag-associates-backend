import "./config/env.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import successStoryRoutes from "./routes/successStoryRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

import "./jobs/subscriptionCron.js";

import passport from "./config/passport.js";

connectDB();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://agandassociates.org", // your Hostinger domain
      "https://www.agandassociates.org",
      "https://admin.agandassociates.org",
    ],
    credentials: true,
  }),
);

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/plans", planRoutes);
app.use("/api/success-stories", storyRoutes);

app.use("/api/admin/success-stories", successStoryRoutes);

app.get("/", (req, res) => {
  res.send("AG Associates API Running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
