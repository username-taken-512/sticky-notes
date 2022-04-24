function getAccessToken() { return window.localStorage.getItem('accessToken') || null }

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
    return { _error: error, _errorCode: 666 }
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