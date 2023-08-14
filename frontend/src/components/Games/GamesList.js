import { Fragment, useCallback, useRef, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, useNavigation, useSubmit, useActionData } from 'react-router-dom';

import Container from '../../layout/Grid/Container';
import Row from '../../layout/Grid/Row';
import Column from '../../layout/Grid/Column';
import Button from '../UI/Button';
import Alert from '../UI/Alert';
import FormGroup from '../UI/FormGroup';
import GamesListItem from './GamesListItem';
import { gamesListFormActions } from '../../store/gamesListFormSlice';
import { gamesListActions } from '../../store/gamesListSlice';
import Pagination from '../UI/Pagination';

const GamesListFilterForm = forwardRef((props, ref) => {
    const formName = 'games-list-form';
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const submit = useSubmit();

    const actionData = useActionData();
    const isSubmitting = navigation.state === 'submitting';

    const page = useSelector(state => state['games-list'].page);
    const isFormValid = useSelector(state => state[formName].isFormValid);

    const formSubmitHandler = (event) => {
        event.preventDefault();

        if(!isFormValid) {
            dispatch(gamesListFormActions.updateIsInputTouched({ input: 'size', isInputTouched: true }));
            dispatch(gamesListFormActions.updateIsInputTouched({ input: 'elo-range', isInputTouched: true }));
            return;
        }

        submit(event.currentTarget);
    };

    let alertCmp = null;

    if(!isSubmitting && actionData) {
        alertCmp = (
            <Alert color={actionData.ok ? 'success' : 'danger'}>
                {actionData.ok ? 'Logged in successfully!' : actionData.message}
            </Alert>
        );
    }

    return (
        <Form method="get" className="games-list-filters" onSubmit={formSubmitHandler} ref={ref}>
            <Row columns={3}>
                <Column>
                    <Row columns={2} className="px-4">
                        <Column>
                            <FormGroup
                                id="size"
                                label="Board size"
                                inputProps={{
                                    form: formName,
                                    actions: gamesListFormActions,
                                    type: "select",
                                    name: "size",
                                    options: [
                                        {
                                            text: 'All sizes',
                                            value: 'all-sizes'
                                        },
                                        {
                                            text: '19x19',
                                            value: '19'
                                        },
                                        {
                                            text: '13x13',
                                            value: '13'
                                        },
                                        {
                                            text: '9x9',
                                            value: '9'
                                        }
                                    ],
                                    defaultValue: 'all-sizes',
                                    required: true,
                                    onValidate: (value) => {
                                        value = value.trim();
                                        const sizes = ['all-sizes', '19', '13', '9'];
                                        if(sizes.indexOf(value) === -1) {
                                            return [false, 'Board size can only be all sizes, 19x19, 13x13 or 9x9.'];
                                        } else {
                                            return [true, null];
                                        }
                                    }
                                }}
                            />
                        </Column>
                        <Column>
                            <FormGroup
                                id="elo-range"
                                label="Players ELO range"
                                inputProps={{
                                    form: formName,
                                    actions: gamesListFormActions,
                                    type: "select",
                                    name: "elo-range",
                                    options: [
                                        {
                                            text: 'All ELOs',
                                            value: 'all-elos'
                                        },
                                        {
                                            text: '2000-1500',
                                            value: '2000-1500',
                                        },
                                        {
                                            text: '1500-1000',
                                            value: '1500-1000'
                                        },
                                        {
                                            text: '1000-500',
                                            value: '1000-500',
                                        },
                                        {
                                            text: '500-0',
                                            value: '500-0',
                                        },
                                    ],
                                    defaultValue: 'all-elos',
                                    required: true,
                                    onValidate: (value) => {
                                        value = value.trim();
                                        const eloRanges = [
                                            'all-elos',
                                            '2000-1500',
                                            '1500-1000',
                                            '1000-500',
                                            '500-0'
                                        ];
                                        if(eloRanges.indexOf(value) === -1) {
                                            return [false, 'Elo range is not allowed.'];
                                        } else {
                                            return [true, null];
                                        }
                                    }
                                }}
                            />
                        </Column>
                    </Row>
                </Column>
                <Column>
                    <FormGroup
                        id="started-at-order"
                        label="Order by game start date"
                        className="px-4"
                        inputProps={{
                            form: formName,
                            actions: gamesListFormActions,
                            type: "select",
                            name: "started-at-order",
                            options: [
                                {
                                    text: 'Most recently started',
                                    value: 'desc'
                                },
                                {
                                    text: 'Oldest started',
                                    value: 'asc',
                                },
                            ],
                            defaultValue: 'desc',
                            required: true,
                            onValidate: (value) => {
                                value = value.trim();
                                const orders = [
                                    'desc',
                                    'asc'
                                ];
                                if(orders.indexOf(value) === -1) {
                                    return [false, 'Game start date order can only be from the most recently started or oldest started.'];
                                } else {
                                    return [true, null];
                                }
                            }
                        }}
                    />
                    <input type="hidden" name="page" value={page} />
                </Column>
                <Column>
                    <div className="d-flex justify-content-end align-items-center h-100">
                        <Button type="submit" disabled={isSubmitting}>
                            Apply
                        </Button>
                    </div>
                </Column>
            </Row>
        </Form>
    );
});

const GamesList = props => {
    const {
        filters
    } = props;
    const dispatch = useDispatch();
    const filterFormRef = useRef();
    const gamesList = useSelector(state => state['games-list']);
    const submit = useSubmit();

    const pageChangeHandler = useCallback((page) => {
        dispatch(gamesListActions.changePage({
            page
        }));

        filterFormRef.current.page.value = page;

        submit(filterFormRef.current);
    }, [dispatch, submit]);

    return (
        <Container>
            <Fragment>
                {filters && <GamesListFilterForm ref={filterFormRef} />}
                {gamesList.total > 0 ? (
                    <Fragment>
                        <Row columns={3}>
                            {gamesList.games.map(game => (
                                <Column key={game._id}>
                                    <GamesListItem game={game} />
                                </Column>
                            ))}
                        </Row>
                        {gamesList.totalPages > 1 && filters && (
                            <Pagination
                                currentPage={gamesList.page}
                                totalPages={gamesList.totalPages}
                                onPageChange={pageChangeHandler}
                            />
                        )}
                    </Fragment>
                ): (
                    <Row>
                        <Column className="text-center">
                            {/* TODO: Add a button to refresh list */}
                            No games being played at the moment.
                        </Column>
                    </Row>
                )}
            </Fragment>
        </Container>
    );
}

export default GamesList;