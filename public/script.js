const notesContainer = document.getElementById("app");
const addNoteButton = notesContainer.querySelector(".add-note");
let unSavedData = JSON.parse(localStorage.getItem("unsaved-sticky"));
let cloudNotes;

// Fetches all notes from DB and renders to HTML page
async function fetchAndRenderAllNotes() {
  const notes = await getAllNotes();
  for (const note of notes) {
    renderNoteHTML(note);
  }
} fetchAndRenderAllNotes();

addNoteButton.addEventListener("click", () => addNote());

// Renders a note to the HTML page by creating buttons and putting it inside a new <div/>
function renderNoteHTML(note) {
  const divForElement = document.createElement("div");
  const saveButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const idNote = note.id;
  const noteElement = createNoteElement(idNote, note.content);
  initAppendButtons(saveButton, deleteButton, idNote, divForElement, noteElement);
  notesContainer.insertBefore(divForElement, addNoteButton);
  saveButton.addEventListener("click", () => {
    saveButtonClicked(idNote);
  });
  deleteButton.addEventListener("click", () => {
    deleteConfirm(idNote);
  });
}

function getLocalNotes() {
  return JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
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
    //noteObject.user_id = note.user_id;
    cloudNotesReturn.push(noteObject);
  });
  return cloudNotesReturn;
}

// Saves an array of notes to the local storage 
function saveNotes(notes) {
  localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
}

// Creates the needed HTML elements for the actualy sticky note
function createNoteElement(id, content) {
  const element = document.createElement("textarea");
  element.classList.add("note");
  element.value = content;
  element.placeholder = "Empty sticky note";
  element.addEventListener("input", () => {
    updateNote(id, element.value);
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
  const divForElement = document.createElement("div");
  initAppendButtons(saveButton, deleteButton, idNote, divForElement, noteElement);
  notesContainer.insertBefore(divForElement, addNoteButton);
  saveButton.addEventListener("click", () => {
    saveButtonClicked(idNote);
  });
  deleteButton.addEventListener("click", () => {
    deleteConfirm(idNote);
  });
  notes.push(noteObject);
  saveNotes(notes);
}

// Updates notes when editing and checks if note is already in localStorage or is to be added
async function updateNote(id, newContent) {
  let notesLocal = getLocalNotes();
  let targetNote = notesLocal.filter((note) => note.id == id)[0];
  if (targetNote == null) {
    targetNote = cloudNotes.filter((note) => note.id == id)[0];
    targetNote.content = newContent;
    notesLocal.push(targetNote);
  } else {
    targetNote.content = newContent;
  }
  saveNotes(notesLocal);
}

function removeLocalNote(id) {
  const notes = getLocalNotes().filter((note) => note.id != id);
  saveNotes(notes);
}

// Deletes a note from the local storage
function deleteNote(id) {
  const notes = getLocalNotes().filter((note) => note.id != id);
  const divForElement = document.getElementById("stickynote_div_" + id);
  removeFromUnsaved(id);
  saveNotes(notes);
  notesContainer.removeChild(divForElement);
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

function saveNoteToCloud(note) {
  console.log(!!note.uuid);
  // todo save to cloud
  // check if note has uuid, else post a new note
}

function saveButtonClicked(id) {
  const note = getLocalNotes().find(element => element.id === id);
  saveNoteToCloud(note);
  removeFromUnsaved(id);
  toggleSaveButton(id, "saveOFF");
  removeLocalNote(id);
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
function initAppendButtons(saveButton, deleteButton, idNote, divForElement, noteElement) {
  initSaveButton(saveButton, idNote);
  initDeleteButton(deleteButton, idNote);
  divForElement.setAttribute("id", "stickynote_div_" + idNote);
  divForElement.appendChild(noteElement);
  divForElement.appendChild(saveButton);
  divForElement.appendChild(deleteButton);
}

// Add a note to the list of notes that has yet to be saved to the cloud
function addToUnsaved(id) {
  if (unSavedData != null && !unSavedData.includes(id)) {
    unSavedData.push(id);
    localStorage.setItem("unsaved-sticky", JSON.stringify(unSavedData));
  }
}

// Remove a note id from the list of notes that has yet to be saved to the cloud
function removeFromUnsaved(id) {
  for (var i = 0; i < unSavedData.length; i++) {
    if (unSavedData[i] == id) {
      unSavedData.splice(i, 1);
    }
  }
  localStorage.setItem("unsaved-sticky", JSON.stringify(unSavedData));
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