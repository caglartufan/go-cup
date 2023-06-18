import { Link, Form } from 'react-router-dom';

import FormGroup from '../components/UI/FormGroup';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

import './Login.scss';

function LoginPage() {
    return (
        <div className="login">
            <div className="login__logo">
                Go Cup
            </div>
            <p className="login__description">
                Log in to your Go Cup account
            </p>
            <Card border>
                <Form>
                    <FormGroup
                        id="login"
                        label="User name or e-mail address"
                        inputProps={{
                            type: "text",
                            name: "login"
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
                            name: "password"
                        }}
                    />
                    <div className="text-center">
                        <Button className="w-100">
                            Log in
                        </Button>
                        <span className="login__or">
                            or
                        </span>
                        <Button className="w-100">
                            Sign up
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
}

export default LoginPage;