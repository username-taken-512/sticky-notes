// ### Login 
let refreshInterval;

// Logout button
document.getElementById('logout-button').addEventListener('click', async (event) => {
  event.preventDefault();

  // Notify server of logout
  try {
    result = await (response = await fetch('/api/users/login', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: (window.sessionStorage.getItem('refreshToken') || '')
      })
    }));
  } catch (error) {
    console.log(error);
  }

  // Clear tokens
  window.sessionStorage.setItem('refreshToken', '');
  window.sessionStorage.setItem('accessToken', '');

  clearInterval(refreshInterval); // Stop refreshing tokens
  alert('Logged out');
});

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
      window.sessionStorage.setItem('accessToken', result.accessToken);
      window.sessionStorage.setItem('refreshToken', result.refreshToken);

      // Continiously refresh tokens while on page
      refreshInterval = setInterval(() => {
        refreshToken();
      }, 5000);
      break;
  }
}

// ### Token management
// Get stored auth token
function getAccessToken() { return window.sessionStorage.getItem('accessToken') || null }

// Refresh access token & store locally
async function refreshToken() {
  let result;
  let response;
  try {
    result = await (response = await fetch('/api/users/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: window.sessionStorage.getItem('refreshToken')
      })
    })).json();
  } catch (error) {
    console.log(error);
  }

  if (response.status === 200) {
    window.sessionStorage.setItem('accessToken', result.accessToken);
  }
}


// ### Register
// Register Form
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
      break;
  }
}