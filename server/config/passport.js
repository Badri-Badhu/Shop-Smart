const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");

// 🔹 GOOGLE STRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const fullName = profile.displayName.split(" ");
        const firstName = fullName[0];
        const lastName = fullName.slice(1).join(" ");

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            firstName,
            lastName,
            password: "GOOGLE_AUTH",
            gender: "Other",
            dob: null,
            addresses: [],
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// // 🔹 FACEBOOK STRATEGY
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//       callbackURL: "/api/auth/facebook/callback",
//       profileFields: ["id", "emails", "name"], // 👈 important to get email
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails?.[0]?.value;

//         if (!email) {
//           return done(new Error("Facebook account has no email"), null);
//         }

//         const firstName = profile.name.givenName;
//         const lastName = profile.name.familyName;

//         let user = await User.findOne({ email });

//         if (!user) {
//           user = await User.create({
//             email,
//             firstName,
//             lastName,
//             password: "FACEBOOK_AUTH",
//             gender: "other",
//             dob: null,
//             addresses: [],
//           });
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// Optional session support
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
