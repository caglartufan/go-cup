import { Link, Form, useNavigate, useSubmit, useActionData, useNavigation, redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { socket } from '../../websocket';
import { loginFormActions } from '../../store/loginFormSlice';
import { userActions } from '../../store/userSlice';
import { toastActions } from '../../store/toastSlice';
import { store } from '../../store/store';

import { setAuthToken } from '../../utils/auth';

import FormGroup from '../../components/UI/FormGroup';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Alert from '../../components/UI/Alert';

import './style.scss';

const LoginPage = () => {
    const formName = 'login-form';
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const submit = useSubmit();

    const actionData = useActionData();
    const isSubmitting = navigation.state === 'submitting';

    const isFormValid = useSelector(state => state[formName].isFormValid);

    const formSubmitHandler = (event) => {
        event.preventDefault();

        if(!isFormValid) {
            dispatch(loginFormActions.updateIsInputTouched({ input: 'login', isInputTouched: true }));
            dispatch(loginFormActions.updateIsInputTouched({ input: 'password', isInputTouched: true }));
            return;
        }

        submit(event.currentTarget);
    };

    const switchToSignupHandler = () => {
        navigate('/signup');
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
        <div className="login">
            <div className="login__logo">
                Go Cup
            </div>
            <p className="login__description">
                Log in to your Go Cup account
            </p>
            <Card box-shadow="heavy" border>
                {alertCmp}
                <Form method='post' onSubmit={formSubmitHandler}>
                    <FormGroup
                        id="login"
                        label="User name or e-mail address"
                        inputProps={{
                            form: formName,
                            actions: loginFormActions,
                            type: "text",
                            name: "login",
                            required: true,
                            onValidate: (value) => {
                                value = value.trim();
                                if(!value) {
                                    return [false, 'User name or e-mail address is required.']
                                } else if(value.length < 3 || value.length > 30) {
                                    return [false, 'User name or e-mail address must be a minimum of 3 characters and a maximum of 30 characters'];
                                } else {
                                    return [true, null];
                                }
                            }
                        }}
                    />
                    <FormGroup
                        id="password"
                        label="Password"
                        sideLabelElement={
                            <Link to="/password-reset">
                                Forgot password?
                            </Link>
                        }
                        inputProps={{
                            form: formName,
                            actions: loginFormActions,
                            type: "password",
                            name: "password",
                            required: true,
                            onValidate: (value) => {
                                value = value.trim();
                                if(!value) {
                                    return [false, 'Password is required.']
                                } else if(value.length < 4 || value.length > 100) {
                                    return [false, 'Password must be a minimum of 4 characters and a maximumof 100 characters.'];
                                } else {
                                    return [true, null];
                                }
                            }
                        }}
                    />
                    <div className="text-center">
                        <Button className="w-100" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Log in'}
                        </Button>
                        <span className="login__or">
                            or
                        </span>
                        <Button className="w-100" onClick={switchToSignupHandler}>
                            Sign up
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export const action = async ({ request }) => {
    const formData = await request.formData();

    const loginData = {
        login: formData.get('login'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: request.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const resData = await response.json();

        if(!response.ok) {
            if(!resData?.message) {
                return { message: 'Could not log in!' };
            }
            
            return resData;
        }

        const user = resData.user;

        const authHeader = response.headers.get('Authorization');
        const token = authHeader.split(' ')[1];

        setAuthToken(token);

        // Clean login form
        store.dispatch(loginFormActions.reset());

        // Update user state
        store.dispatch(userActions.update(user));

        // Add toast message with success message
        store.dispatch(toastActions.add({
            message: 'Logged in successfully!',
            status: 'success'
        }));

        // Send authenticated event to websocket
        socket.emit('authenticated', token);

        return redirect('/');
    } catch(error) {
        // In case fails to fetch
        return error;
    }
};

export default LoginPage;