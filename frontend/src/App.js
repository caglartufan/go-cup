import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authLoader, authMiddleware, logoutAction, noAuthMiddleware } from './utils/auth';

import { store } from './store/store';
import io from './websocket';

import RootLayout from './layout/Root/Root';
import HomePage from './pages/Home';
import LoginPage, { action as loginAction } from './pages/Login';
import SignupPage, { action as signupAction } from './pages/Signup';
import LeaderbordPage from './pages/Leaderboard';
import GamesPage from './pages/Games';
import GameDetailPage from './pages/GameDetail';
import ProfilePage from './pages/Profile';
import { useEffect } from 'react';

const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		loader: authLoader,
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
				action: loginAction,
				loader: noAuthMiddleware
			},
			{
				path: 'signup',
				element: <SignupPage />,
				action: signupAction,
				loader: noAuthMiddleware
			},
			{
				path: 'profile',
				element: <ProfilePage />,
				loader: authMiddleware
			},
			{
				path: 'logout',
				action: logoutAction,
				loader: authMiddleware
			}
		]
	}
])

const App = () => {
	useEffect(() => {
		io.on('connect', () => {
			console.log('Connected!');
		});

		io.on('loggedIn', from => {
			console.log('Logged in from ' + from);
		});

		return () => {
			io.off('connect');
			io.off('loggedIn');
		};
	}, []);

	return (
		<Provider store={store}>
			<RouterProvider router={router} />
		</Provider>
	);
}

export default App;
