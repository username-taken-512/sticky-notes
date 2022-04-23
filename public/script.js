const notesContainer = document.getElementById("app");
const addNoteButton = notesContainer.querySelector(".add-note");
let unSavedData = JSON.parse(localStorage.getItem("unsaved-sticky"));

getNotes().forEach((note) => {
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
});

addNoteButton.addEventListener("click", () => addNote());

function getNotes() {
  return JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
}

function saveNotes(notes) {
  localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
}

function createNoteElement(id, content) {
  const element = document.createElement("textarea");

  element.classList.add("note");
  element.value = content;
  element.placeholder = "Empty sticky note";

  element.addEventListener("input", () => {
    updateNote(id, element.value);
    addToUnsaved(id);
    toggleSaveButton(id, "saveON");

    // keep here
    console.log(localStorage.getItem("unsaved-sticky"));

  });

  element.addEventListener("dblclick", () => {
    deleteConfirm(id);
  });

  return element;
}

function addNote() {
  const notes = getNotes();
  const noteObject = {
    id: Math.floor(Math.random() * 100000),
    content: "",
    dbid: ""
  };
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

function updateNote(id, newContent) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id == id)[0];

  targetNote.content = newContent;
  saveNotes(notes);
}

function deleteNote(id) {
  const notes = getNotes().filter((note) => note.id != id);
  const divForElement = document.getElementById("stickynote_div_" + id);
  removeFromUnsaved(id);
  saveNotes(notes);
  notesContainer.removeChild(divForElement);
}

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

function saveNotesPermanent(note) {
  console.log(note);
}

function saveButtonClicked(id) {
  const note = getNotes().find(element => element.id === id);
  saveNotesPermanent(note);
  removeFromUnsaved(id);
  toggleSaveButton(id, "saveOFF");

  console.log(localStorage.getItem("unsaved-sticky"));

}

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

function deleteConfirm(id) {
  const doDelete = confirm(
    "Are you sure you wish to delete this sticky note?"
  );
  if (doDelete) {
    deleteNote(id);
  }
}

function initAppendButtons(saveButton, deleteButton, idNote, divForElement, noteElement) {
  initSaveButton(saveButton, idNote);
  initDeleteButton(deleteButton, idNote);

  divForElement.setAttribute("id", "stickynote_div_" + idNote);
  divForElement.appendChild(noteElement);
  divForElement.appendChild(saveButton);
  divForElement.appendChild(deleteButton);
}

function addToUnsaved(id) {
  if (unSavedData != null && !unSavedData.includes(id)) {
    unSavedData.push(id);
    localStorage.setItem("unsaved-sticky", JSON.stringify(unSavedData));
  }
}

function removeFromUnsaved(id) {
  for (var i = 0; i < unSavedData.length; i++) {
    if (unSavedData[i] == id) {
      unSavedData.splice(i, 1);
    }
  }
  localStorage.setItem("unsaved-sticky", JSON.stringify(unSavedData));
}