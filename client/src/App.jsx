import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/authUtils";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import NoticeBoard from "./pages/NoticeBoard";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import { db } from "./firebase/config";
import { collection, onSnapshot } from "firebase/firestore";

// Protected route component
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  const requestPermission = async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error("Notification permission request failed:", error);
      }
    }
  };

  const listenToNoticeChanges = () => {
    const noticesRef = collection(db, "noticesCollection");

    onSnapshot(noticesRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (
          (change.type === "added" || change.type === "modified") &&
          change.doc.data().isUrgent
        ) {
          const notice = change.doc.data();
          console.log("Urgent Notice Change Detected:", notice);

          // Trigger a notification
          if (Notification.permission === "granted") {
            const notifTitle = notice.title || "Urgent Notice";
            const notifBody =
              notice.content || "An urgent notice has been updated.";
            const options = {
              body: notifBody,
              icon: "/icon-192-192.png", // Replace with your app's icon
            };
            new Notification(notifTitle, options);
          }
        }
      });
    });
  };

  useEffect(() => {
    requestPermission();
    listenToNoticeChanges();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Dashboard />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/events"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Events />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/clubs"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Clubs />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/notices"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <NoticeBoard />
                  </>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <Profile />
                  </>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
