// ### Login 
let refreshInterval;


// Login form
document.getElementById('login-form').addEventListener('submit', event => {
    event.preventDefault();

    const loginForm = document.forms['login-form'].elements;
    login(loginForm.username.value, loginForm.password.value);
});

// Login - Request tokens
async function login(username, password) {
    // Attempt to login, store response in result
    let result;
    let response;
    try {
        result = await (response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })).json();
    } catch (error) {
        console.log(error);
    }

    switch (response.status) {
        case 403:
            alert('Authentication failed');
            break;
        case 500:
            alert('General error');
            break;
        case 200:
            alert('Login succesful');
            // Store tokens
            window.localStorage.setItem('accessToken', result.accessToken);
            window.localStorage.setItem('refreshToken', result.refreshToken);

            window.location.href = "/index.html"

            // Continiously refresh tokens while on page
            refreshInterval = setInterval(() => {
                refreshToken();
            }, 5000);
            break;
    }
}

// ### Token management
// Get stored auth token
function getAccessToken() { return window.localStorage.getItem('accessToken') || null }

// Refresh access token & store locally
async function refreshToken() {
    let result;
    let response;
    try {
        result = await (response = await fetch('/api/users/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: window.localStorage.getItem('refreshToken')
            })
        })).json();
    } catch (error) {
        console.log(error);
    }

    if (response.status === 200) {
        window.localStorage.setItem('accessToken', result.accessToken);
    }
}

async function checkLoginStatus() {

    console.log(window.localStorage.getItem('refreshToken'))

    if (!window.localStorage.getItem('refreshToken')) return;

    try {
        result = await (response = await fetch('/api/users/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: window.localStorage.getItem('refreshToken')
            })
        })).json();
    } catch (error) {
        console.log(error);
    }

    switch (response.status) {
        case 200:
            window.localStorage.setItem('accessToken', result.accessToken);
            alert('Logged in')
            break;

        case 500:
            alert('General error');
            break;
        case 403:
            alert('Not logged in.');
            window.localStorage.setItem('accessToken', '');
            window.localStorage.setItem('accessToken', '');
            break;
    }

}

checkLoginStatus();