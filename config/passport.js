import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      //   callbackURL: "http://localhost:5001/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
          });
        } else if (!user.googleId) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        done(null, {
          _id: user._id,
          name: user.name,
          email: user.email,
          token,
        });
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

export default passport;
