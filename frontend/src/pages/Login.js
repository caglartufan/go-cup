import { useState } from 'react';
import { Link, Form, useNavigate, useSubmit } from 'react-router-dom';

import FormGroup from '../components/UI/FormGroup';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

import './Login.scss';

function LoginPage() {
    const navigate = useNavigate();
    const submit = useSubmit();
    const [isLoginValid, setIsLoginValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    var setIsLoginInputTouched = null;
    var setIsPasswordInputTouched = null;
    var resetLoginInput = null;
    var resetPasswordInput = null;

    let isFormValid = false;

    if(isLoginValid && isPasswordValid) {
        isFormValid = true;
    }

    function formSubmitHandler(event) {
        event.preventDefault();

        if(!isFormValid) {
            setIsLoginInputTouched(true);
            setIsPasswordInputTouched(true);
            return;
        }

        console.log('submit', isFormValid);

        resetLoginInput();
        resetPasswordInput();
        submit(event.currentTarget);
    }

    function loginValidityChangeHandler(isValid) {
        setIsLoginValid(isValid);
    }

    function passwordValidityChangeHandler(isValid) {
        setIsPasswordValid(isValid);
    }

    function setIsLoginInputTouchedHandler(setIsInputTouched) {
         setIsLoginInputTouched = setIsInputTouched;
    }

    function setIsPasswordInputTouchedHandler(setIsInputTouched) {
        setIsPasswordInputTouched = setIsInputTouched;
    }

    function resetLoginInputHandler(reset) {
        resetLoginInput = reset;
    }

    function resetPasswordInputHandler(reset) {
        resetPasswordInput = reset;
    }

    function switchToSignupHandler() {
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
                            },
                            onValidityChange: loginValidityChangeHandler,
                            onIsInputTouched: setIsLoginInputTouchedHandler,
                            onReset: resetLoginInputHandler
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
                            type: "password",
                            name: "password",
                            required: true,
                            validity: (value) => {
                                value = value.trim();
                                if(!value) {
                                    return [false, 'Password is required.']
                                } else if(value.length < 4 || value.length > 1024) {
                                    return [false, 'Password must be a minimum of 4 characters and a maximumof 1024 characters.'];
                                } else {
                                    return [true, null];
                                }
                            },
                            onValidityChange: passwordValidityChangeHandler,
                            onIsInputTouched: setIsPasswordInputTouchedHandler,
                            onReset: resetPasswordInputHandler
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