import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import RootLayout from './layout/Root/Root';
import HomePage from './pages/Home/Home';

const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <HomePage />
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
