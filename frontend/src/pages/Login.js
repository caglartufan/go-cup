import { Link, Form, useNavigate, useSubmit } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { loginFormActions } from '../store/loginFormSlice';

import FormGroup from '../components/UI/FormGroup';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

import './Login.scss';

const LoginPage = () => {
    const formName = 'login-form';
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const submit = useSubmit();
    const isFormValid = useSelector(state => state[formName].isFormValid);

    const formSubmitHandler = (event) => {
        event.preventDefault();

        if(!isFormValid) {
            dispatch(loginFormActions.updateIsInputTouched({ input: 'login', isInputTouched: true }));
            dispatch(loginFormActions.updateIsInputTouched({ input: 'password', isInputTouched: true }));
            return;
        }

        dispatch(loginFormActions.reset('login'));
        dispatch(loginFormActions.reset('password'));
        submit(event.currentTarget);
    }

    const switchToSignupHandler = () => {
        navigate('/signup');
    }

    return (
        <div className="login">
            <div className="login__logo">
                Go Cup
            </div>
            <p className="login__description">
                Log in to your Go Cup account
            </p>
            <Card border>
                <Form onSubmit={formSubmitHandler}>
                    <FormGroup
                        id="login"
                        label="User name or e-mail address"
                        inputProps={{
                            form: formName,
                            type: "text",
                            name: "login",
                            required: true,
                            validity: (value) => {
                                value = value.trim();
                                if(!value) {
                                    return [false, 'Username or e-mail address is required.']
                                } else if(value.length < 3 || value.length > 30) {
                                    return [false, 'Username or e-mail address must be a minimum of 3 characters and a maximum of 30 characters'];
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
                            type: "password",
                            name: "password",
                            required: true,
                            validity: (value) => {
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
                        <Button className="w-100" type="submit">
                            Log in
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
}

export default LoginPage;