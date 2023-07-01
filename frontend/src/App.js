import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authLoader, authMiddleware, logoutAction, noAuthMiddleware } from './utils/auth';
import { setSocketId } from './utils/websocket';

import { store } from './store/store';

import socket from './websocket';

import RootLayout from './layout/Root/Root';
import HomePage from './pages/Home';
import LoginPage, { action as loginAction } from './pages/Login';
import SignupPage, { action as signupAction } from './pages/Signup';
import LeaderbordPage from './pages/Leaderboard';
import GamesPage from './pages/Games';
import GameDetailPage from './pages/GameDetail';
import ProfilePage from './pages/Profile';

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
]);

const App = () => {
	useEffect(() => {
		socket.on('connect', () => {
			setSocketId(socket.id);
			console.log('Connected with id: ' + socket.id);
		});

		socket.on('matched', () => {
			console.log('matched!');
		});

		return () => {
			socket.off('connect');
			socket.off('matched');
		};
	}, []);

	return (
		<Provider store={store}>
			<RouterProvider router={router} />
		</Provider>
	);
};

export default App;
