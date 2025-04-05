const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

exports.newUser = functions.auth.user().onCreate(async user => {
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

exports.subscribeToClub = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.clubAffiliation !== after.clubAffiliation) {
      const userId = context.params.userId;
      const clubIds = after.clubAffiliation;

      for (const clubId of clubIds) {
        await admin
          .firestore()
          .collection("clubsCollection")
          .doc(clubId)
          .update({
            subscribers: admin.firestore.FieldValue.increment(1),
          });
      }
    }
  });

exports.unsubscribeFromClub = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.clubAffiliation !== after.clubAffiliation) {
      const userId = context.params.userId;
      const clubIds = before.clubAffiliation;

      for (const clubId of clubIds) {
        await admin
          .firestore()
          .collection("clubsCollection")
          .doc(clubId)
          .update({
            subscribers: admin.firestore.FieldValue.increment(-1),
          });
      }
    }
  });

exports.registerForEvent = functions.firestore
	.document("users/{userId}")
	.onUpdate(async (change, context) => {
		const before = change.before.data();
		const after = change.after.data();

		if (before.participation !== after.participation) {
			const userId = context.params.userId;
			const eventIds = after.participation;

			for (const eventId of eventIds) {
				await admin
					.firestore()
					.collection("eventsCollection")
					.doc(eventId)
					.update({
						participants: admin.firestore.FieldValue.arrayUnion(userId),
					});
			}
		}
	});

exports.unregisterFromEvent = functions.firestore
	.document("users/{userId}")
	.onUpdate(async (change, context) => {
		const before = change.before.data();
		const after = change.after.data();

		if (before.participation !== after.participation) {
			const userId = context.params.userId;
			const eventIds = before.participation;

			for (const eventId of eventIds) {
				await admin
					.firestore()
					.collection("eventsCollection")
					.doc(eventId)
					.update({
						participants: admin.firestore.FieldValue.arrayRemove(userId),
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
