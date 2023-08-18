import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import WebSocketProvider from './websocket/WebSocketProvider';

import { store } from './store/store';

import RootLayout from './layout/Root';
import HomePage, { loader as homeLoader } from './pages/Home';
import LoginPage, { action as loginAction } from './pages/Login';
import SignupPage, { action as signupAction } from './pages/Signup';
import LeaderbordPage, { loader as leaderboardLoader } from './pages/Leaderboard';
import GamesPage, { loader as gamesLoader } from './pages/Games';
import GameDetailPage, { loader as gameDetailLoader } from './pages/GameDetail';
import ProfilePage, { loader as profileLoader } from './pages/Profile';
import GamesTab, { loader as gamesTabLoader } from './pages/Profile/Games';
import StatisticsTab, { loader as statisticsTabLoader } from './pages/Profile/Statistics';
import ProfileSettingsTab, { loader as profileSettingTabLoader } from './pages/Profile/ProfileSettings';

import { authLoader, authMiddleware, logoutAction, noAuthMiddleware } from './utils/auth';

const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		loader: authLoader,
		children: [
			{
				index: true,
				element: <HomePage />,
				loader: homeLoader
			},
			{
				path: 'games',
				children: [
					{
						index: true,
						element: <GamesPage />,
						loader: gamesLoader
					},
					{
						id: 'GameDetailPage',
						path: ':gameId',
						element: <GameDetailPage />,
						loader: gameDetailLoader
					}
				]
			},
			{
				path: 'leaderboard',
				element: <LeaderbordPage />,
				loader: leaderboardLoader
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
				loader: profileLoader,
				children: [
					{
						index: true,
						element: <GamesTab />,
						loader: gamesTabLoader,
					},
					{
						path: 'statistics',
						element: <StatisticsTab />,
						loader: statisticsTabLoader
					},
					{
						path: 'profile-settings',
						element: <ProfileSettingsTab />,
						loader: profileSettingTabLoader
					}
				]
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
	return (
		<Provider store={store}>
			<WebSocketProvider navigate={router.navigate} >
				<RouterProvider router={router} />
			</WebSocketProvider>
		</Provider>
	);
};

export default App;
