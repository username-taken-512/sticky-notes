// ### Login 
let refreshInterval;

// Logout button
document.getElementById('logout-button').addEventListener('click', async (event) => {
  event.preventDefault();

  // Notify server of logout
  try {
    result = (response = await fetch('/api/users/login', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: (window.localStorage.getItem('refreshToken') || '')
      })
    }))

    window.localStorage.setItem(userid + "-stickynotes-notes", '');

  } catch (error) {
    console.log(error);
  }

  // Clear tokens
  window.localStorage.setItem('refreshToken', '');
  window.localStorage.setItem('accessToken', '');

  clearInterval(refreshInterval); // Stop refreshing token
  window.location.replace("/login.html")
});


async function checkLoginStatus() {

  console.log(window.localStorage.getItem('refreshToken'))

  if (!window.localStorage.getItem('refreshToken')) window.location.href = "/login.html";

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
      break;

    case 500:
      alert('General error');
      break;
    case 403:
      alert('Not logged in.');
      window.localStorage.setItem('accessToken', '');
      window.localStorage.setItem('accessToken', '');
      window.location.href = "/login.html"
      break;
  }

}

checkLoginStatus();