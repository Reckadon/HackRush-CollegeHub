import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/authUtils";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import NoticeBoard from "./pages/NoticeBoard";
import Navbar from "./components/Navbar";

// Protected route component
const PrivateRoute = ({ children }) => {
	const { currentUser } = useAuth();

	if (!currentUser) {
		return <Navigate to="/login" />;
	}

	return children;
};

const App = () => {
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
					</Routes>
				</div>
			</AuthProvider>
		</Router>
	);
};

export default App;
