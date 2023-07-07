import { useNavigate, useNavigation, useSubmit, useActionData, redirect, Form } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthToken } from '../utils/auth';

import { socket } from '../websocket';
import { store } from '../store/store';
import { signupFormActions } from '../store/signupFormSlice';
import { userActions } from '../store/userSlice';
import { toastActions } from '../store/toastSlice';

import Card from '../components/UI/Card';
import FormGroup from '../components/UI/FormGroup';
import Button from '../components/UI/Button';
import Alert from '../components/UI/Alert';

const SignupPage = () => {
    const formName = 'signup-form';
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const navigation = useNavigation();
    const submit = useSubmit();

    const actionData = useActionData();
    const isSubmitting = navigation.state === 'submitting';

    const isFormValid = useSelector(state => state[formName].isFormValid);
    const alreadyInUseUsernames = useSelector(state => state[formName].inputs.username.alreadyInUseValues);
    const alreadyInUseEmails = useSelector(state => state[formName].inputs.email.alreadyInUseValues);
    const passwordValue = useSelector(state => state[formName].inputs.password.value);

    const formSubmitHandler = (event) => {
        event.preventDefault();

        if(!isFormValid) {
            dispatch(signupFormActions.updateIsInputTouched({ input: 'username', isInputTouched: true }));
            dispatch(signupFormActions.updateIsInputTouched({ input: 'email', isInputTouched: true }));
            dispatch(signupFormActions.updateIsInputTouched({ input: 'password', isInputTouched: true }));
            dispatch(signupFormActions.updateIsInputTouched({ input: 'password-confirmation', isInputTouched: true }));
            return;
        }

        submit(event.currentTarget);
    };

    const switchToLoginHandler = () => {
        navigate('/login');
    };

    let alertCmp = null;

    if(!isSubmitting && actionData) {
        alertCmp = (
            <Alert color={actionData.ok ? 'success' : 'danger'}>
                {actionData.ok ? 'Signed up successfully!' : actionData.message}
            </Alert>
        );
    }

    return (
        <div className="login">
            <div className="login__logo">
                Go Cup
            </div>
            <p className="login__description">
                Create a new Go Cup account
            </p>
            <Card box-shadow="heavy" border>
                {alertCmp}
                <Form method='post' onSubmit={formSubmitHandler}>
                    <FormGroup
                        id="username"
                        label="User name"
                        inputProps={{
                            form: formName,
                            actions: signupFormActions,
                            type: "text",
                            name: "username",
                            required: true,
                            onValidate: (value) => {
                                value = value.trim();
                                if(!value) {
                                    return [false, 'User name is required.']
                                } else if(value.length < 3 || value.length > 30) {
                                    return [false, 'User name must be a minimum of 3 characters and a maximum of 30 characters'];
                                } else if(alreadyInUseUsernames.includes(value)) {
                                    return [false, 'User name is already in use.'];
                                } else {
                                    return [true, null];
                                }
                            }
                        }}
                    />
                    <FormGroup
                        id="email"
                        label="E-mail address"
                        inputProps={{
                            form: formName,
                            actions: signupFormActions,
                            type: "email",
                            name: "email",
                            required: true,
                            onValidate: (value) => {
                                value = value.trim();
                                if(!value) {
                                    return [false, 'E-mail address is required.']
                                } else if(!value.includes('@')) {
                                    return [false, 'Enter a valid e-mail address.'];
                                } else if(alreadyInUseEmails.includes(value)) {
                                    return [false, 'E-mail address is already in use.'];
                                } else {
                                    return [true, null];
                                }
                            }
                        }}
                    />
                    <FormGroup
                        id="password"
                        label="Password"
                        inputProps={{
                            form: formName,
                            actions: signupFormActions,
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
                    <FormGroup
                        id="password-confirmation"
                        label="Password confirmation"
                        inputProps={{
                            form: formName,
                            actions: signupFormActions,
                            type: "password",
                            name: "password-confirmation",
                            required: true,
                            onValidate: (value) => {
                                value = value.trim();
                                if(!value) {
                                    return [false, 'Password confirmation is required.']
                                } else if(value !== passwordValue) {
                                    return [false, 'Password and password confirmation does not match.'];
                                } else {
                                    return [true, null];
                                }
                            }
                        }}
                    />
                    <div className="text-center">
                        <Button className="w-100" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Signing up...' : 'Sign up'}
                        </Button>
                        <span className="login__or">
                            or
                        </span>
                        <Button className="w-100" onClick={switchToLoginHandler}>
                            Log in
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export const action = async ({ request }) => {
    const formData = await request.formData();

    const signupData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        'password-confirmation': formData.get('password-confirmation')
    };

    try {
        const response = await fetch('http://localhost:3000/api/signup', {
            method: request.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });
        
        const resData = await response.json();

        if(!response.ok) {
            if(!resData?.message) {
                return { message: 'Could not sign up!' };
            }

            if(resData.errors) {
                Object.entries(resData.errors).forEach(([input, message]) => {
                    if( message?.includes('already in use')) {
                        store.dispatch(
                            signupFormActions.addAlreadyInUseValue({ input })
                        );
                    }
                });
            }

            return resData;
        }

        const user = resData.user;

        const authHeader = response.headers.get('Authorization');
        const token = authHeader.split(' ')[1];

        setAuthToken(token);

        // Clean sign up form
        store.dispatch(signupFormActions.reset());

        // Update user state
        store.dispatch(userActions.update(user));

        // Add toast message with success message
        store.dispatch(toastActions.add({
            message: 'Signed up successfully!',
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

export default SignupPage;