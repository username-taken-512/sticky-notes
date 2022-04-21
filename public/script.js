const notesContainer = document.getElementById("app");
const addNoteButton = notesContainer.querySelector(".add-note");

getNotes().forEach((note) => {
  const divForElement = document.createElement("div");
  const saveButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const idNote = note.id;

  initSaveButton(saveButton, idNote);
  initDeleteButton(deleteButton, idNote);

  const noteElement = createNoteElement(idNote, note.content);
  divForElement.setAttribute("id", "stickynote_div_" + idNote);
  divForElement.appendChild(noteElement);
  divForElement.appendChild(saveButton);
  divForElement.appendChild(deleteButton);

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
  element.placeholder = "Empty Sticky Note";

  element.addEventListener("input", () => {
    updateNote(id, element.value);
    toggleSaveButton(id, "saveON");
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
    content: ""
  };

  const idNote = noteObject.id;
  const noteElement = createNoteElement(idNote, noteObject.content);
  const saveButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const divForElement = document.createElement("div");

  initSaveButton(saveButton, idNote);
  initDeleteButton(deleteButton, idNote);

  divForElement.setAttribute("id", "stickynote_div_" + idNote);
  divForElement.appendChild(noteElement);
  divForElement.appendChild(saveButton);
  divForElement.appendChild(deleteButton);

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

  saveNotes(notes);
  notesContainer.removeChild(divForElement);
}

function toggleSaveButton(id, toggleTo) {
  const saveButton = document.getElementById("stickynote_btn_" + id);
  switch (toggleTo) {
    case "saveON":
      saveButton.disabled = false;
      saveButton.className = "saveButtonON";
      console.log("save button on");
      break;
    case "saveOFF":
      saveButton.disabled = true;
      saveButton.className = "saveButtonOFF";
      break;
  }
}

function saveNotesPermanent(notes) {
  // save to db here
}

function saveButtonClicked(id) {
  console.log("save clicked");
  const notes = getNotes();
  saveNotesPermanent(notes);
  toggleSaveButton(id, "saveOFF");
}

function initSaveButton(saveButton, idNote) {
  saveButton.setAttribute("id", "stickynote_btn_" + idNote);
  saveButton.disabled = true;
  saveButton.className = "saveButtonOFF";
  saveButton.innerHTML = "&#x1f4be";
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