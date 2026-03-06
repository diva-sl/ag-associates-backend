import cron from "node-cron";
import User from "../models/User.js";

cron.schedule("0 0 * * *", async () => {
  console.log("Running subscription expiry check");

  const today = new Date();

  await User.updateMany(
    {
      subscriptionExpiry: { $lt: today },
    },
    {
      subscription: "none",
    },
  );
});
