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
