function getAccessToken() { return window.localStorage.getItem('accessToken') || null }

// ### Database interaction
// Get notes from db
async function getNotesFromDb() {
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
  }

  switch (response.status) {
    case 200:
      return result;
    case 403:
      console.log('Error sending to db: Not logged in');
      return { _error: 'Not authorized', _errorCode: 403 };
    case 500:
      console.log('Error sending to db: Internal error');
      break;
  }
}

// Create new note in db
async function postNoteToDb(note) {
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
  }

  switch (response.status) {
    case 200:
      console.log('Note uploaded');
      return result;
    case 403:
      console.log('Error sending to db: Not logged in');
      return { _error: 'Not authorized', _errorCode: 403 };
    case 500:
      console.log('Error sending to db: Internal error');
      break;
  }
}

// Update note in db
async function updateNoteInDb(note) {
  try {
    result = await (response = await fetch('/api/notes', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getAccessToken()
      },
      body: JSON.stringify(note)
    })).json();
  } catch (error) {
    console.log(error);
  }

  switch (response.status) {
    case 200:
      console.log('Note Updated');
      return result;
    case 403:
      console.log('Error sending to db: Not logged in');
      return { _error: 'Not authorized', _errorCode: 403 };
    case 500:
      console.log('Error sending to db: Internal error');
      break;
  }
}
