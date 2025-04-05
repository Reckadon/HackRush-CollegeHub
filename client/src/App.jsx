import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/authUtils";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import NoticeBoard from "./pages/NoticeBoard";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import { auth } from "./firebase/config";

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

	const randomNotification = () => {
		if (Notification.permission !== "granted") return;
		const games = [
			{
				name: "Game 1",
				author: "Author 1",
				slug: "game1",
			},
			{
				name: "Game 2",
				author: "Author 2",
				slug: "game2",
			},
			{
				name: "Game 3",
				author: "Author 3",
				slug: "game3",
			},
		];
		const randomItem = Math.floor(Math.random() * games.length);
		const notifTitle = games[randomItem].name;
		const notifBody = `Created by ${games[randomItem].author}.`;
		const notifImg = `data/img/${games[randomItem].slug}.jpg`;
		const options = {
			body: notifBody,
			icon: notifImg,
		};
		new Notification(notifTitle, options);
		// setTimeout(randomNotification, 10000);
	};

	useEffect(() => {
		requestPermission();
		// randomNotification();
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
