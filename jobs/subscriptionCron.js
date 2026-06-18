import cron from "node-cron";
import User from "../models/User.js";

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running subscription expiry check...");

    const today = new Date();

    const result = await User.updateMany(
      {
        subscriptionExpiry: {
          $lt: today,
        },
      },
      {
        $set: {
          subscriptionStatus: "expired",
          subscription: "none",
          subscriptionPlan: null,
        },
      },
    );

    console.log(`${result.modifiedCount} subscriptions expired`);
  } catch (error) {
    console.log(error);
  }
});
