import { Fragment, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Header from '../Header/Header';
import QueuePreview from '../QueuePreview/QueuePreview';
import Toast from '../../components/UI/Toast';

const RootLayout = () => {
    // TODO: Add defer for loading to show a spinner or some kind of loading state component
    // https://beta.reactrouter.com/en/main/guides/deferred
    const toasts = useSelector(store => store.toast);
    const isInQueue = useSelector(store => store.queue.isInQueue);

    useEffect(() => {
        console.log('rendering2');
        return () => {
            console.log('leaving2!');
        };
    }, []);

    return (
        <Fragment>
            <Header />
            <main>
                {isInQueue && <QueuePreview />}
                <Outlet />
            </main>
            {toasts.length > 0 && (
                <div id="toast-container">
                    {toasts.map((toast, index) => (
                        <Toast
                            message={toast.message}
                            status={toast.status}
                            delay={toast.delay}
                            index={index}
                            key={toast.message}
                        />
                    ))}
                </div>
            )}
        </Fragment>
    );
}

export default RootLayout;