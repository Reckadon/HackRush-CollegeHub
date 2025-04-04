const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

exports.newUser = functions.auth.user().onCreate(async (user) => {
  if (user.email?.endsWith("@iitgn.ac.in")) {
    admin.firestore().collection("users").doc(user.uid).set({
      email: user.email,
      displayName: user.displayName,
      uid: user.uid,
      roles: [], // student, admin, club-cordi, club-member, club-generalmember, etc.
      clubAffiliation: [], // subscriptions to clubs
      intrests: [], // intrests of the user if using that
    });
  } else {
    await admin.auth().deleteUser(user.uid);
    console.log(`Deleted user ${user.uid} with email ${user.email}`);
  }
});
