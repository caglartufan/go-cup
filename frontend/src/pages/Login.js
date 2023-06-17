import { Link, Form } from 'react-router-dom';

import FormGroup from '../components/UI/FormGroup';

function LoginPage() {
    return (
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
            <div>
                <button>
                    Log in
                </button>
                <span>
                    or
                </span>
                <button>
                    Sign up
                </button>
            </div>
        </Form>
    );
}

export default LoginPage;