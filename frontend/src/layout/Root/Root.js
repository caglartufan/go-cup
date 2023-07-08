import { Fragment } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatSeconds } from '../../utils/helpers';

import Header from '../Header/Header';
import Toast from '../../components/UI/Toast';

const RootLayout = () => {
    // TODO: Add defer for loading to show a spinner or some kind of loading state component
    // https://beta.reactrouter.com/en/main/guides/deferred
    const toasts = useSelector(store => store.toast);
    const queueData = useSelector(store => store.queue);

    return (
        <Fragment>
            <Header />
            <main>
                {queueData.isInQueue && (
                    <div>
                        <dl>
                            <dt>
                                Currently in queue
                            </dt>
                            <dd>
                                {queueData.inQueue}
                            </dd>
                            <dt>
                                Time elapsed
                            </dt>
                            <dd>
                                {formatSeconds((queueData.timeElapsed / 1000).toFixed(2))}
                            </dd>
                        </dl>
                        <button>
                            Cancel
                        </button>
                    </div>
                )}
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