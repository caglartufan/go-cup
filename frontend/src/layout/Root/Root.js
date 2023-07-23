import { Fragment, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Header from '../Header/Header';
import QueuePreview from '../QueuePreview/QueuePreview';
import Toast from '../../components/UI/Toast';
import Modal from '../../components/UI/Modal';

const RootLayout = () => {
    // TODO: Add defer for loading to show a spinner or some kind of loading state component
    // https://beta.reactrouter.com/en/main/guides/deferred
    const toasts = useSelector(store => store.toast);
    const isInQueue = useSelector(store => store.queue.isInQueue);

    // useEffect(() => {
    //     document.body.classList.add('modal-open');
    // }, []);

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
            {/* <Modal
                title="Opponent requests an undo"
                buttons={[
                    {
                        text: 'Reject',
                        color: 'danger',
                        onClick: () => {}
                    },
                    {
                        text: 'Accept',
                        color: 'success',
                        onClick: () => {}
                    }
                ]}
            >
                Your opponent requests an undo. Do you want to accept?
            </Modal> */}
        </Fragment>
    );
}

export default RootLayout;