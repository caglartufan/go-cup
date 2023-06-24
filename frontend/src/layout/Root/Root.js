import { Fragment } from 'react';
import { Outlet } from 'react-router-dom';

import Header from '../Header/Header';

const RootLayout = () => {
    // TODO: Add defer for loading to show a spinner or some kind of loading state component
    // https://beta.reactrouter.com/en/main/guides/deferred
    return (
        <Fragment>
            <Header />
            <main>
                <Outlet />
            </main>
        </Fragment>
    );
}

export default RootLayout;