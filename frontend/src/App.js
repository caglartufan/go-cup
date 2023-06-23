import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { logoutAction } from './utils/auth';

import { store } from './store/store';

import RootLayout from './layout/Root/Root';
import HomePage from './pages/Home';
import LoginPage, { action as loginAction } from './pages/Login';
import SignupPage from './pages/Signup';
import LeaderbordPage from './pages/Leaderboard';
import GamesPage from './pages/Games';
import GameDetailPage from './pages/GameDetail';
import ProfilePage from './pages/Profile';

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
				element: <LoginPage />,
				action: loginAction
			},
			{
				path: 'signup',
				element: <SignupPage />
			},
			{
				path: 'profile',
				element: <ProfilePage />
			},
			{
				path: 'logout',
				action: logoutAction
			}
		]
	}
])

const App = () => {
	return (
		<Provider store={store}>
			<RouterProvider router={router} />
		</Provider>
	);
}

export default App;
