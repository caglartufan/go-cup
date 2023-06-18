class UserDTO {
    #login = '';
    #username = '';
    #email = '';
    #password = '';
    #passwordConfirmation = '';

    constructor(login, username, email, password, passwordConfirmation) {
        this.#login = login;
        this.#username = username;
        this.#email = email;
        this.#password = password;
        this.#passwordConfirmation = passwordConfirmation;
    }

    static withRequestData(requestData) {
        return new UserDTO(
            requestData['login'],
            requestData['username'],
            requestData['email'],
            requestData['password'],
            requestData['password-confirmation']
        )
    }

    get login() {
        return this.#login;
    }

    set login(value) {
        this.#login = login;
    }

    get username() {
        return this.#username;
    }

    set username(value) {
        this.#username = value;
    }

    get email() {
        return this.#email;
    }

    set email(value) {
        this.#email = value;
    }

    get password() {
        return this.#password;
    }

    set password(value) {
        this.#password = value;
    }

    get passwordConfirmation() {
        return this.#passwordConfirmation;
    }

    set passwordConfirmation(value) {
        this.#passwordConfirmation = value;
    }
}

module.exports = UserDTO;