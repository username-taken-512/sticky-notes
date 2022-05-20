// ### Login 
let refreshInterval;

checkLoginStatus();

async function checkLoginStatus() {

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