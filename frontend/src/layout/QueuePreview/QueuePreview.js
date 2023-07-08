import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from '../../websocket';
import { queueActions } from '../../store/queueSlice';

import { formatSeconds } from '../../utils/helpers';

import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

import './QueuePreview.scss';

let interval;

const QueuePreview = () => {
    const dispatch = useDispatch();
    const queueData = useSelector(store => store.queue);
    const [timeElapsedInSeconds, setTimeElapsedInSeconds] = useState(Math.floor(queueData.timeElapsed / 1000));

    useEffect(() => {
        interval = setInterval(() => {
            setTimeElapsedInSeconds(prevTimeElapsed => prevTimeElapsed + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const cancelHandler = useCallback(() => {
        socket.emit('cancel');
        dispatch(queueActions.cancelled());
    }, [dispatch]);

    return (
        <div className="container">
            <Card className="queue-preview" box-shadow="light">
                <dl className="queue-preview__details">
                    <div className="queue-preview__details-group">
                        <dt className="queue-preview__details-term">
                            Currently in queue
                        </dt>
                        <dd className="queue-preview__details-description">
                            {queueData.inQueue}
                        </dd>
                    </div>
                    <div className="queue-preview__details-group">
                        <dt className="queue-preview__details-term">
                            Time elapsed
                        </dt>
                        <dd className="queue-preview__details-description">
                            {formatSeconds(timeElapsedInSeconds)}
                        </dd>
                    </div>
                </dl>
                <div className="queue-preview__actions">
                    <Button onClick={cancelHandler}>
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default QueuePreview;