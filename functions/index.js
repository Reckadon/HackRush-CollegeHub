// @ts-nocheck
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

exports.newUser = functions.auth.user().onCreate(async (user) => {
  if (user.email?.endsWith("@iitgn.ac.in")) {
    var officialEventsEmailList = [
      "blithchron@iitgn.ac.in",
      "amalthea@iitgn.ac.in",
      "metis@iitgn.ac.in",
      "24110098@iitgn.ac.in",
    ]; // add more emails here for events
    var officialClubsEmailList = ["metis@iitgn.ac.in"]; // add more clubs here
    var officialEmails = ["sports@iitgn.ac.in", "acad@iitgn.ac.in"]; // add more emails here for official emails

    if (officialEventsEmailList.includes(user.email)) {
      admin
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set({
          email: user.email,
          displayName: user.displayName,
          uid: user.uid,
          roles: [user.email.split("@")[0]], // event
          clubAffiliation: [], // subscriptions to clubs
          intrests: [], // intrests of the user if using that
          saved: [],
          participation: [], // always leave this empty
        });
    }
    if (officialClubsEmailList.includes(user.email)) {
      admin
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set({
          email: user.email,
          displayName: user.displayName,
          uid: user.uid,
          roles: [user.email.split("@")[0]], // club
          clubAffiliation: [], // subscriptions to other clubs
          intrests: [], // intrests of the user if using that
          saved: [],
          participation: [], // always leave this empty
        });
    }
    if (officialEmails.includes(user.email)) {
      admin
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set({
          email: user.email,
          displayName: user.displayName,
          uid: user.uid,
          roles: [user.email.split("@")[0]], // official emails
          clubAffiliation: [], // subscriptions to clubs
          intrests: [], // intrests of the user if using that
          saved: [],
          participation: [], // always leave this empty
        });
    }

    admin
      .firestore()
      .collection("users")
      .doc(user.uid)
      .set({
        email: user.email,
        displayName: user.displayName,
        uid: user.uid,
        roles: ["student"], // student, admin, club-cordi, club-member, club-generalmember, etc.
        clubAffiliation: [], // subscriptions to clubs
        intrests: [], // intrests of the user if using that
        participation: [], // events participating in
        saved: [],
      });
  } else {
    await admin.auth().deleteUser(user.uid);
    console.log(`Deleted user ${user.uid} with email ${user.email}`);
  }
});

exports.subscribeUnsubscribeToClub = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.clubAffiliation !== after.clubAffiliation) {
      const userId = context.params.userId;
      const clubIds = after.clubAffiliation;
      const oldClubIds = before.clubAffiliation;
      const newClubIds = clubIds.filter((clubId) => !oldClubIds.includes(clubId));
      const removedClubIds = oldClubIds.filter((clubId) => !clubIds.includes(clubId));

      for (const clubId of newClubIds) {
        var currentSubscribers = await admin
          .firestore()
          .collection("clubsCollection")
          .doc(clubId)
          .get()
          .then((doc) => {
            if (doc.exists) {
              admin
                .firestore()
                .collection("clubsCollection")
                .doc(clubId)
                .update({
                  // @ts-ignore
                  subscribers: doc.data().subscribers + 1,
                });
            } else {
              console.log("No such document!");
              return 0;
            }
          });
      }
      for (const clubId of removedClubIds) {
        var currentSubscribers = await admin
          .firestore()
          .collection("clubsCollection")
          .doc(clubId)
          .get()
          .then((doc) => {
            if (doc.exists) {
              admin
                .firestore()
                .collection("clubsCollection")
                .doc(clubId)
                .update({
                  // @ts-ignore
                  subscribers: doc.data().subscribers - 1,
                });
            } else {
              console.log("No such document!");
              return 0;
            }
          });
      }
    }
  });




exports.registerUnregisterForEvent = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.participation !== after.participation) {
      const userId = context.params.userId;
      const eventIds = after.participation;
      const oldEventIds = before.participation;
      const newEventIds = eventIds.filter((eventId) => !oldEventIds.includes(eventId));
      const removedEventIds = oldEventIds.filter((eventId) => !eventIds.includes(eventId));
      for (const eventId of newEventIds) {
          var currentSubscribers = await admin
            .firestore()
            .collection("eventsCollection")
            .doc(eventId)
            .get().then((doc) => {
              if (doc.exists) {
                var participants = doc.data().participants;
                participants.push(userId);
                console.log("participants", participants);
                admin
                  .firestore()
                  .collection("eventsCollection")
                  .doc(eventId)
                  .update({
                    // @ts-ignore
                    participants: participants,
                  });
              } else {
                console.log("No such document!");
                return 0;
              }
            });
        
      }
      for (const eventId of removedEventIds) {
        var currentSubscribers = await admin
          .firestore()
          .collection("eventsCollection")
          .doc(eventId)
          .get()
          .then((doc) => {
            if (doc.exists) {
              var participants = doc.data().participants;
              participants = participants.filter(
                (participant) => participant !== userId
              );
              console.log("participants", participants);
              admin
                .firestore()
                .collection("eventsCollection")
                .doc(eventId)
                .update({
                  // @ts-ignore
                  participants: participants,
                });
            } else {
              console.log("No such document!");
              return 0;
            }
          });
      }
    }
  });



// event database schema
{
  // eventsCollection
  // {
  //   eventId: "event id",
  //   title: "event name",
  //   description: "event description",
  //   date: "event date",
  //   time: "event time",
  //   location: "event location",
  //   filters: ["tech", "cult"],
  //   clubAffiliation: ["club1", "club2"],
  //   participants: ["user1", "user2"],
  //   isActive: true,
  //   poster: "poster url",
  //   postedBy: "user id",
  //   createdAt: "timestamp",
  //   isApproved: true,
  // }
}

// club database schema
{
  // clubsCollection
  // {
  //   clubId: "club id",
  //   name: "club name",
  //   description: "club description",
  //   members: ["user1", "user2"],
  //   subscribers: 100,
  //   clubPhoto: "club photo url",
  //   filters: ["tech"],
  // }
}

// notice board database schema
{
  // noticeBoardCollection
  // {
  //   noticeId: "notice id",
  //   title: "notice title",
  //   description: "notice description",
  //   date: "notice date",
  //   time: "notice time",
  //   filters: [],
  //   postedBy: "user id",
  // }
}

// notification database schema
{
  // notificationsCollection
  // {
  //   notificationId: "notification id",
  //   title: "notification title",
  //   description: "notification description",
  //   date: "notification date",
  //   time: "notification time",
  //   filters: [],
  //   postedBy: "user id",
  // }
}
