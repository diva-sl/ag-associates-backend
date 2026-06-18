export const updateSubscriptionStatus = async (user) => {
  if (
    user.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) < new Date()
  ) {
    user.subscriptionStatus = "expired";

    await user.save();
  }

  return user;
};
