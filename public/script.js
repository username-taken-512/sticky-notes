const notesContainer = document.getElementById("app");
const headerContainer = document.getElementById("top")
const addNoteButton = notesContainer.querySelector(".add-note");
let unSavedData = JSON.parse(localStorage.getItem(getUserId() + "-unsaved-sticky"));
let cloudNotes;

notesContainer.setAttribute("style", "display: grid;");
headerContainer.setAttribute("style", "display: flex;");

// Fetches all notes from DB and renders to HTML page
async function fetchAndRenderAllNotes() {
  const notes = await getAllNotes();
  for (const note of notes) {
    renderNoteHTML(note);
  }
} fetchAndRenderAllNotes();

addNoteButton.addEventListener("click", () => addNote());

function dueDateDivHTMLBuilder(date_due, idNote) {

  const dateElem = document.createElement("input");
  dateElem.setAttribute("type", "date");

  dateElem.setAttribute("type", "time");
  dateElem.setAttribute("id", idNote);
  dateElem.setAttribute("value", date_due);
}

// Renders a note to the HTML page by creating buttons and putting it inside a new <div/>
function renderNoteHTML(note) {
  const idNote = note.id;
  const divForElement = document.createElement("div");
  const saveButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const finishLabel = document.createElement("label");
  const finishButton = document.createElement("input");
  finishButton.setAttribute("type", "checkbox");
  const dateLabel = document.createElement("span");
  const dueDateDiv = document.createElement('div')
  const noteElement = createNoteElement(idNote, note.content);

  dateLabel.innerHTML = `<span class="date-label warning">Not saved</span>`;
  if (!!note.date_created) {
    dateLabel.innerHTML = `<span class="date-label">Date created: </span><span class="date-value"> ${note.date_created}</span>`;
  }
  const dueDateElem = document.createElement("input")
  dueDateElem.setAttribute("type", "date");
  dueDateElem.setAttribute("id", idNote);
  if (note.date_due) {
    dueDateElem.setAttribute("value", note.date_due);
  }
  if (note.date_done) {
    dateLabel.innerHTML = `<span class="date-label">Date Completed: </span><span class="date-value"> ${note.date_done}</span>`;
    finishButton.checked = true;
    finishButton.setAttribute("disabled", "true");
    dueDateElem.setAttribute("disabled", "true");
    noteElement.setAttribute("disabled", "true");
  }
  if (note.date_due) {
    dueDateDiv.innerHTML = `<span class="date-label">This task is due:</span>`
  } else {
    dueDateDiv.innerHTML = `<span class="date-label">Set due date:</span>`
  }

  initAppendButtons(saveButton, deleteButton, finishButton, idNote, divForElement, noteElement, dateLabel, dueDateDiv, dueDateElem, finishLabel);
  notesContainer.insertBefore(divForElement, addNoteButton);
  saveButton.addEventListener("click", async () => {
    if (await saveButtonClicked(idNote)) {
      if (finishButton.checked) {
        if (!noteElement.getAttribute("disabled")) {
          noteElement.toggleAttribute("disabled");
          dueDateElem.toggleAttribute("disabled");
          finishButton.toggleAttribute("disabled");
        }
      }
    }
  });
  deleteButton.addEventListener("click", () => {
    deleteConfirm(idNote);
  });

  dueDateElem.addEventListener("input", () => {
    updateNote(note.id, "due_date", dueDateElem.value);
    addToUnsaved(note.id);
    toggleSaveButton(note.id, "saveON");
  })
}

function getLocalNotes() {
  return JSON.parse(localStorage.getItem(getUserId() + "-stickynotes-notes") || "[]");
}

async function getCloudNotes() {
  const cloudNotes = await getNotesFromDb();
  let cloudNotesReturn = [];
  cloudNotes.forEach((note) => {
    const noteObject = getEmptyNoteObject();
    noteObject.content = note.content;
    noteObject.date_created = note.date_created;
    noteObject.date_done = note.date_done;
    noteObject.date_due = note.date_due;
    noteObject.uuid = note.uuid;

    cloudNotesReturn.push(noteObject);
  });
  return cloudNotesReturn;
}

// Saves an array of notes to the local storage 
function saveNotes(notes) {
  localStorage.setItem(getUserId() + "-stickynotes-notes", JSON.stringify(notes));
}

// Creates the needed HTML elements for the actualy sticky note
function createNoteElement(id, content) {
  const element = document.createElement("textarea");
  element.classList.add("note");
  element.value = content;
  element.placeholder = "Empty sticky note";
  element.addEventListener("input", () => {
    updateNote(id, "content", element.value);
    addToUnsaved(id);
    toggleSaveButton(id, "saveON");
  });
  element.addEventListener("dblclick", () => {
    deleteConfirm(id);
  });
  return element;
}

// Adds a new note when the '+'-button is pressed
function addNote() {
  const notes = getLocalNotes();
  const noteObject = getEmptyNoteObject();
  const idNote = noteObject.id;
  const noteElement = createNoteElement(idNote, noteObject.content);
  const saveButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const finishLabel = document.createElement("label");
  const finishButton = document.createElement("input");
  finishButton.setAttribute("type", "checkbox");
  const divForElement = document.createElement("div");
  const dateLabelElement = document.createElement("span");
  const dueDateDiv = document.createElement('div')
  dateLabelElement.innerHTML = `<span class="date-label warning">Not saved</span>`;
  const dueDateElem = document.createElement("input")
  dueDateElem.setAttribute("type", "date");
  dueDateElem.setAttribute("id", idNote);

  if (noteObject.date_due) {
    dueDateDiv.innerHTML = `<span class="date-label">This task is due:</span>`
  } else {
    dueDateDiv.innerHTML = `<span class="date-label">Set due date:</span>`
  }

  initAppendButtons(saveButton, deleteButton, finishButton, idNote, divForElement, noteElement, dateLabelElement, dueDateDiv, dueDateElem, finishLabel);
  notesContainer.insertBefore(divForElement, addNoteButton);
  saveButton.addEventListener("click", async () => {
    if (await saveButtonClicked(idNote)) {
      if (finishButton.checked) {
        if (!noteElement.getAttribute("disabled")) {
          noteElement.toggleAttribute("disabled");
          dueDateElem.toggleAttribute("disabled");
          finishButton.toggleAttribute("disabled");
        }
      }
    }
  });
  deleteButton.addEventListener("click", () => {
    deleteConfirm(idNote);
  });

  dueDateElem.addEventListener("input", () => {
    updateNote(idNote, "due_date", dueDateElem.value);
    addToUnsaved(idNote);
    toggleSaveButton(idNote, "saveON");
  })

  notes.push(noteObject);
  saveNotes(notes);
}

// Updates notes when editing and checks if note is already in localStorage or is to be added
async function updateNote(id, type, newContent) {
  let notesLocal = getLocalNotes();
  let targetNote = notesLocal.filter((note) => note.id == id)[0];

  if (type === "content") {
    if (targetNote == null) {
      targetNote = cloudNotes.filter((note) => note.id == id)[0];
      targetNote.content = newContent;
      notesLocal.push(targetNote);
    } else {
      targetNote.content = newContent;
    }
  } else if (type === "date_done") {
    if (targetNote == null) {
      targetNote = cloudNotes.filter((note) => note.id == id)[0];
      targetNote.date_done = newContent;

      notesLocal.push(targetNote);
    } else {
      targetNote.date_done = newContent;
    }
  } else if (type === "due_date") {
    if (targetNote == null) {
      targetNote = cloudNotes.filter((note) => note.id == id)[0];
      targetNote.date_due = newContent;

      notesLocal.push(targetNote);
    } else {
      targetNote.date_due = newContent;
    }
  }

  saveNotes(notesLocal);
}


function removeLocalNote(id) {
  const notes = getLocalNotes().filter((note) => note.id != id);
  saveNotes(notes);
}

// Deletes a note from the local- and cloud storage
async function deleteNote(id) {
  let result;
  let method = 0;
  for (var i = 0; i < cloudNotes.length; i++) {
    if (cloudNotes[i].id === id) {
      method = 1;
      result = await deleteNoteInDb(cloudNotes[i]);
      break;
    }
  }
  if (method === 1 && !(!!result._error)) {
    innerDeleteFromLocal();
  } else if (method === 1 && !!result._error) {
    alert("There was an error deleting the note. Try logging in again or check internet connection.");
  } else if (method === 0) {
    innerDeleteFromLocal();
  }
  function innerDeleteFromLocal() {
    const notes = getLocalNotes().filter((note) => note.id != id);
    const divForElement = document.getElementById("stickynote_div_" + id);
    removeFromUnsaved(id);
    saveNotes(notes);
    notesContainer.removeChild(divForElement);
  }
}

// Toggles the save button disabled/enabled 
function toggleSaveButton(id, toggleTo) {
  const saveButton = document.getElementById("stickynote_btn_" + id);
  switch (toggleTo) {
    case "saveON":
      saveButton.disabled = false;
      saveButton.className = "saveButtonON";
      break;
    case "saveOFF":
      saveButton.disabled = true;
      saveButton.className = "saveButtonOFF";
      break;
  }
}

async function saveNoteToCloud(note) {
  let result;
  if (!!note.uuid) {
    result = await updateNoteInDb(note);
    if (!!result._error) {
      return false;
    }

    if (note.date_done !== null && note.date_done !== undefined && note.date_done !== '') {
      document.getElementById('stickynote_div_' + note.id).getElementsByTagName('span')[1].innerHTML = `<span class="date-label">Date completed: </span><span class="date-value"> ${note.date_done}</span>`;
    }
  } else {
    result = await postNoteToDb(note);
    if (!(!!result._error)) {
      note.uuid = result.uuid;
      note.date_created = result.date_created;
      note.date_done = result.date_done;
      if (note.date_done === null || note.date_done === undefined || note.date_done === '') {
        document.getElementById('stickynote_div_' + note.id).getElementsByTagName('span')[1].innerHTML = `<span class="date-label">Date created: </span><span class="date-value"> ${note.date_created}</span>`;
      } else {
        document.getElementById('stickynote_div_' + note.id).getElementsByTagName('span')[1].innerHTML = `<span class="date-label">Date completed: </span><span class="date-value"> ${note.date_done}</span>`;
      }

      cloudNotes.push(note);
    }
  }
  return result;
}

async function saveButtonClicked(id) {
  const note = getLocalNotes().find(element => element.id === id);
  const result = await saveNoteToCloud(note);
  let disabled = false;
  if (!(!!result._error)) {
    removeFromUnsaved(id);
    toggleSaveButton(id, "saveOFF");
    removeLocalNote(id);

    if (note.date_done) {
      disabled = true;
    }
  } else {
    alert("Note could not be saved to cloud. Try logging in again or check internet connection.");
  }
  return disabled;
}

// Initiates the save button and checks wether it should be enabled/disabled
function initSaveButton(saveButton, idNote) {
  saveButton.setAttribute("id", "stickynote_btn_" + idNote);
  if (unSavedData == null) {
    unSavedData = [];
  }
  if (unSavedData.includes(idNote)) {
    saveButton.disabled = false;
    saveButton.className = "saveButtonON";
    saveButton.innerHTML = "&#x1f4be";
  } else {
    saveButton.disabled = true;
    saveButton.className = "saveButtonOFF";
    saveButton.innerHTML = "&#x1f4be";
  }

}

function initDeleteButton(deleteButton, idNote) {
  deleteButton.setAttribute("id", "stickynote_btnDelete_" + idNote);
  deleteButton.className = "deleteButton";
  deleteButton.innerHTML = "&#128465";
}

function initFinishButton(finishButton, idNote, finishLabel) {
  finishButton.setAttribute("id", "stickynote_chbFinish_" + idNote);
  finishButton.className = "finishButton";
  finishLabel.classList.add('completed-label');
  finishLabel.setAttribute('for', 'stickynote_chbFinish_${idNote}');
  finishLabel.innerText = 'Completed';

  finishButton.addEventListener("change", () => {

    let date = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })

    if (finishButton.checked) {
      updateNote(idNote, "date_done", date.substring(0, 16))
    } else {
      updateNote(idNote, "date_done", "")
    }

    addToUnsaved(idNote)
    toggleSaveButton(idNote, "saveON");

  })
}

// Method asking for confirmation before deletion
function deleteConfirm(id) {
  const doDelete = confirm(
    "Are you sure you wish to delete this sticky note?"
  );
  if (doDelete) {
    deleteNote(id);
  }
}

// Initiates the buttons and appends them to the <div/>, along with the note
function initAppendButtons(saveButton, deleteButton, finishButton, idNote, divForElement, noteElement, dateLabel, dueDateDiv, dueDateElem, finishLabel) {
  initSaveButton(saveButton, idNote);
  initDeleteButton(deleteButton, idNote);
  initFinishButton(finishButton, idNote, finishLabel);
  divForElement.setAttribute("id", "stickynote_div_" + idNote);
  divForElement.appendChild(noteElement);
  divForElement.appendChild(saveButton);
  divForElement.appendChild(deleteButton);
  divForElement.appendChild(finishLabel);
  divForElement.appendChild(finishButton);

  divForElement.appendChild(dueDateDiv)
  dueDateDiv.appendChild(dueDateElem)
  if (dateLabel !== "Not saved.") {
    divForElement.appendChild(dateLabel);
  }
}

// Add a note to the list of notes that has yet to be saved to the cloud
function addToUnsaved(id) {
  if (unSavedData != null && !unSavedData.includes(id)) {
    unSavedData.push(id);
    localStorage.setItem(getUserId() + "-unsaved-sticky", JSON.stringify(unSavedData));
  }
}

// Remove a note id from the list of notes that has yet to be saved to the cloud
function removeFromUnsaved(id) {
  for (var i = 0; i < unSavedData.length; i++) {
    if (unSavedData[i] == id) {
      unSavedData.splice(i, 1);
    }
  }
  localStorage.setItem(getUserId() + "-unsaved-sticky", JSON.stringify(unSavedData));
}

function getEmptyNoteObject() {
  return {
    id: Math.floor(Math.random() * 100000),
    content: "",
    date_created: "",
    date_due: "",
    date_done: "",
    user_id: "",
    uuid: ""
  };
}

// Fetches both the local and cloud notes, combining them and removing doubles (if a note in localStorage 
// also exists is the database and is waiting to be saved to cloud)
async function getAllNotes() {
  const localNotes = getLocalNotes();
  cloudNotes = await getCloudNotes();
  for (var i = 0; i < localNotes.length; i++) {
    for (var j = 0; j < cloudNotes.length; j++) {
      if (!!localNotes[i].uuid) {
        if (localNotes[i].uuid == cloudNotes[j].uuid) {
          cloudNotes.splice(j, 1);
        }
      }
    }
  }
  Array.prototype.push.apply(localNotes, cloudNotes);
  return localNotes;
}