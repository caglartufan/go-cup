import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import WebSocketProvider from './websocket/WebSocketProvider';

import { store } from './store/store';

import RootLayout from './layout/Root/Root';
import HomePage, { loader as homeLoader } from './pages/Home';
import LoginPage, { action as loginAction } from './pages/Login';
import SignupPage, { action as signupAction } from './pages/Signup';
import LeaderbordPage from './pages/Leaderboard';
import GamesPage from './pages/Games';
import GameDetailPage, { loader as gameDetailLoader } from './pages/GameDetail';
import ProfilePage from './pages/Profile';

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
						element: <GamesPage />
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
	return (
		<Provider store={store}>
			<WebSocketProvider navigate={router.navigate} >
				<RouterProvider router={router} />
			</WebSocketProvider>
		</Provider>
	);
};

export default App;
