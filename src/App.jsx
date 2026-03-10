import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import useAuthStore from './store/authStore';
import Register from './pages/Register';
import Login from './pages/Login';
import MainMenu from './pages/MainMenu';
import NewGame from './pages/NewGame';
import LoadGame from './pages/LoadGame';
import CoreEngine from './pages/CoreEngine';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
	const token = useAuthStore((state) => state.token);
	if (!token) {
		return <Navigate to='/login' replace />;
	}
	return children;
};

function App() {
	const token = useAuthStore((state) => state.token);

	return (
		<Router>
			<Routes>
				{/* Dynamic Root Redirection */}
				<Route
					path='/'
					element={
						token ? (
							<Navigate to='/main-menu' />
						) : (
							<Navigate to='/login' />
						)
					}
				/>

				<Route path='/register' element={<Register />} />
				<Route path='/login' element={<Login />} />

				{/* Protected Game Routes */}
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
