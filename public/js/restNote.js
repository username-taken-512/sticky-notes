function getAccessToken() { return window.localStorage.getItem('accessToken') || null; }

function getUserId() {
  return parseJwt(getAccessToken()).id || 0;
}

function getUserName() {
  return parseJwt(getAccessToken()).username || null;
}

// Returns an object of the JWT payload ( Source: https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library )
function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

// ### Database interaction

// Forms the message structure to return
function generateReturn(responseStatus, result) {
  switch (responseStatus) {
    case 200:
      return result;
    case 403:
      console.log('Error sending to db: Not authorized');
      return { _error: 'Not authorized', _errorCode: 403 };
    case 500:
      console.log('Error sending to db: Internal error');
      return { _error: 'Server error', _errorCode: 500 };
  }
}

// Get notes from db
async function getNotesFromDb(runAgain = true) {
  let response;
  let result;
  try {
    result = await (response = await fetch('/api/notes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAccessToken()
      }
    })).json();
  } catch (error) {
    console.log(error);
    return { _error: error, _errorCode: 666 }
  }

  // If auth error, get new access token, then try again - once
  if (response.status !== 200 && runAgain) {
    console.log('retry-grejen', response.status, runAgain);
    await checkLoginStatus();
    return getNotesFromDb(false);
  }

  return generateReturn(response.status, result);
}

// Create new note in db
async function postNoteToDb(note) {
  let response;
  let result;
  try {
    result = await (response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAccessToken()
      },
      body: JSON.stringify(note)
    })).json();
  } catch (error) {
    console.log(error);
    return { _error: error, _errorCode: 666 };
  }
  console.log('response', response);
  console.log('result', result);
  return generateReturn(response.status, result);
}

// Update note in db
async function updateNoteInDb(note) {
  let response;
  let result;
  try {
    result = await (response = await fetch('/api/notes/' + note.uuid, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAccessToken()
      },
      body: JSON.stringify(note)
    })).json();
  } catch (error) {
    console.log(error);
    return { _error: error, _errorCode: 666 };
  }
  return generateReturn(response.status, result);
}

// Delete note in db
async function deleteNoteInDb(note) {
  let response;
  let result;
  try {
    result = await (response = await fetch('/api/notes/' + note.uuid, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAccessToken()
      }
    })).json();
  } catch (error) {
    console.log(error);
    return { _error: error, _errorCode: 666 };
  }
  return generateReturn(response.status, result);
}

// Get Notes summary statistics
async function getNotesSummaryFromDb(runAgain = true) {
  let response;
  let result;
  try {
    result = await (response = await fetch('/api/notes/summary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAccessToken()
      }
    })).json();
  } catch (error) {
    console.log(error);
    return { _error: error, _errorCode: 666 }
  }

  // If auth error, get new access token, then try again - once
  if (response.status !== 200 && runAgain) {
    console.log('retry-grejen', response.status, runAgain);
    await checkLoginStatus();
    return getNotesSummaryFromDb(false);
  }
  return generateReturn(response.status, result);
}

// Get Website visitor statistics
async function getWebsiteStatistics(runAgain = true) {
  let response;
  let result;
  try {
    result = await (response = await fetch('/api/statistics', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAccessToken()
      }
    })).json();
  } catch (error) {
    console.log(error);
    return { _error: error, _errorCode: 666 }
  }

  // If auth error, get new access token, then try again - once
  if (response.status !== 200 && runAgain) {
    console.log('retry-grejen', response.status, runAgain);
    await checkLoginStatus();
    return getWebsiteStatistics(false);
  }
  return generateReturn(response.status, result);
}