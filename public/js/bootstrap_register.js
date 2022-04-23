document.getElementById('register-form').addEventListener('submit', event => {
    event.preventDefault();

    const registerForm = document.forms['register-form'].elements;
    register(registerForm.username.value, registerForm.password.value, registerForm.first_name.value, registerForm.last_name.value);
});


// Register - Send to server
async function register(username, password, firstName, lastName) {
    // Attempt to Register, store response in result
    let result;
    let response;
    try {
        result = await (response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                firstName: firstName,
                lastName: lastName
            })
        })).json();
    } catch (error) {
        console.log(error);
    }

    switch (response.status) {
        case 500:
            alert('General error');
            break;
        case 201:
            alert('Registration succesful');
            window.location.href = "/login.html"
            break;
    }
}