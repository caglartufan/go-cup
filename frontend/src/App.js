import { createBrowserRouter, RouterProvider, Ro } from 'react-router-dom';

import RootLayout from './layout/Root/Root';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import LeaderbordPage from './pages/Leaderboard';
import GamesPage from './pages/Games';
import GameDetailPage from './pages/GameDetail';

const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <HomePage />
			},
			{
				path: 'games',
				children: [
					{
						index: true,
						element: <GamesPage />
					},
					{
						path: ':gameId',
						element: <GameDetailPage />
					}
				]
			},
			{
				path: 'leaderboard',
				element: <LeaderbordPage />
			},
			{
				path: 'login',
				element: <LoginPage />
			},
			{
				path: 'signup',
				element: <SignupPage />
			}
		]
	}
])

function App() {
	return (
		<RouterProvider router={router} />
	);
}

export default App;