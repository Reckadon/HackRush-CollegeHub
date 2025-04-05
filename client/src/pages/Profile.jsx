import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authUtils";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./Profile.css";
import EventCard from "../components/Events/EventCard";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // @ts-ignore
            setUserData(userSnap.data());
            setName(userSnap.data().displayName || "");
            setBio(userSnap.data().bio || "");
          }
          // Fetch user's clubs
          // @ts-ignore
          const clubs = userSnap.data().clubAffiliation || [];
          const clubsData = await Promise.all(
            clubs.map(async (clubId) => {
              const clubRef = doc(db, "clubsCollection", clubId);
              const clubSnap = await getDoc(clubRef);
              return { id: clubId, ...clubSnap.data() };
            })
          );

          // Fetch user's events
          // @ts-ignore
          const events = userSnap.data().participation || [];
          const eventsData = await Promise.all(
            events.map(async (eventId) => {
              try {
                const eventRef = doc(db, "eventsCollection", eventId);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                  const eventData = eventSnap.data();
                  return {
                    id: eventId,
                    ...eventData,
                    date:
                      eventData.date &&
                      (eventData.date.toDate
                        ? eventData.date.toDate()
                        : new Date(eventData.date)),
                  };
                }
                return null;
              } catch (error) {
                console.error(`Error fetching event ${eventId}:`, error);
                return null;
              }
            })
          );

          // Filter out any null values (events that couldn't be fetched)
          const validEventsData = eventsData.filter((event) => event !== null);
          // @ts-ignore
          setUserEvents(validEventsData);
          // @ts-ignore
          setUserClubs(clubsData);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      if (userData?.roles?.includes("admin")) {
        try {
          const eventsRef = collection(db, "eventsCollection");
          const q = query(eventsRef, where("isApproved", "==", false));
          const querySnapshot = await getDocs(q);

          const pendingEvents = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate
              ? doc.data().date.toDate()
              : new Date(doc.data().date),
          }));

          setPendingApprovals(pendingEvents);
        } catch (error) {
          console.error("Error fetching pending approvals:", error);
        }
      }
    };

    fetchPendingApprovals();
  }, [userData]);

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        displayName: name,
        bio: bio,
      });

      setUserData({
        // @ts-ignore
        ...userData,
        displayName: name,
        bio: bio,
      });

      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  const handleApproveEvent = async (eventId) => {
    try {
      const eventRef = doc(db, "eventsCollection", eventId);
      await updateDoc(eventRef, { isApproved: true });

      // Remove the approved event from the pending approvals list
      setPendingApprovals((prev) =>
        prev.filter((event) => event.id !== eventId)
      );

      console.log(`Event ${eventId} approved successfully.`);
    } catch (error) {
      console.error(`Error approving event ${eventId}:`, error);
    }
  };
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="Profile" />
          ) : (
            <div className="profile-initial-big">
              {currentUser?.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
        <div className="profile-info">
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="edit-name"
            />
          ) : (
            <h1>
              {
                // @ts-ignore
                userData?.displayName || currentUser?.displayName
              }
            </h1>
          )}
          <p className="profile-email">{currentUser?.email}</p>
          <div className="profile-roles">
            {
              // @ts-ignore
              userData?.roles && userData.roles.length > 0 ? (
                // @ts-ignore
                userData.roles.map((role, index) => (
                  <span key={index} className="role-badge">
                    {role}
                  </span>
                ))
              ) : (
                <span className="role-badge">Student</span>
              )
            }
          </div>
        </div>
        {!editing ? (
          <button className="edit-profile-btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <button className="save-profile-btn" onClick={handleSave}>
            Save
          </button>
        )}
      </div>

      <div className="profile-body">
        <div className="profile-section">
          <h2>About Me</h2>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="edit-bio"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p>
              {
                // @ts-ignore
                userData?.bio || "No bio provided yet."
              }
            </p>
          )}
        </div>

        <div className="profile-section">
          <h2>Club Affiliations</h2>
          {
            // @ts-ignore
            userData?.clubAffiliation && userData.clubAffiliation.length > 0 ? (
              <ul className="clubs-list">
                {userClubs.map((club, index) => (
                  <li key={index} className="club-item">
                    {
                      // @ts-ignore
                      club.name
                    }
                  </li>
                ))}
              </ul>
            ) : (
              <p>Not affiliated with any clubs yet.</p>
            )
          }
        </div>

        <div className="profile-section">
          <h2>Registered Events</h2>
          {
            // @ts-ignore
            userData?.participation && userData.participation.length > 0 ? (
              <ul className="events-list">
                {userEvents.map((event, index) => (
                  <EventCard key={index} event={event} isShort={true} />
                ))}
              </ul>
            ) : (
              <p>No registered events.</p>
            )
          }
        </div>
        {
          // @ts-ignore

          userData?.roles?.includes("admin") && (
            <div className="profile-section">
              <h2>Pending Approvals</h2>
              {pendingApprovals.length > 0 ? (
                <ul className="events-list">
                  {pendingApprovals.map((event, index) => (
                    <li key={index} className="event-item">
                      <EventCard event={event} isShort={true} />
                      <br />
                      <button
                        className="approve-btn"
                        onClick={() => handleApproveEvent(event.id)}
                      >
                        Approve
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No pending approvals.</p>
              )}
            </div>
          )
        }
      </div>
    </div>
  );
};

export default Profile;
