import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Ensure this import is present.
// If App.jsx is inside a subfolder, change './store' to '../store'
import useGameState from './store/OMD_State_Manager';

import Register from './pages/Register';
import Login from './pages/Login';
import MainMenu from './pages/MainMenu';
import NewGame from './pages/NewGame';
import LoadGame from './pages/LoadGame';
import CoreEngine from './pages/CoreEngine';
import TravelLoadingScreen from './components/ui/TravelLoadingScreen';

// ============================================================================
// PROTECTED ROUTE WRAPPER
// ============================================================================
const ProtectedRoute = ({ children }) => {
	const token = useAuthStore((state) => state.token);

	if (!token) {
		return (
			<Navigate
				to='/login'
				replace
			/>
		);
	}

	return children;
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
function App() {
	const token = useAuthStore((state) => state.token);
	const isTraveling = useGameState((state) => state.isTraveling);

	return (
		<Router>
			{isTraveling && <TravelLoadingScreen />}

			<Routes>
				<Route
					path='/'
					element={token ? <Navigate to='/main-menu' /> : <Navigate to='/login' />}
				/>

				<Route
					path='/register'
					element={<Register />}
				/>
				<Route
					path='/login'
					element={<Login />}
				/>

				<Route
					path='/main-menu'
					element={
						<ProtectedRoute>
							<MainMenu />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/new-game'
					element={
						<ProtectedRoute>
							<NewGame />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/load-game'
					element={
						<ProtectedRoute>
							<LoadGame />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/core-engine'
					element={
						<ProtectedRoute>
							<CoreEngine />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</Router>
	);
}

export default App;
