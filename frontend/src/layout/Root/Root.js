import { Fragment } from 'react';
import { Outlet } from 'react-router-dom';

import Header from '../Header/Header';

function RootLayout() {
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