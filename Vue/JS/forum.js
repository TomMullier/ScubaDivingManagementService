
  
//boutton menu
let menutoggle = document.querySelector('.toggle')
menutoggle.onclick = function () {
  menutoggle.classList.toggle('active');
  menutoggle.classList.toggle('close-modal');
  if (!menutoggle.classList.contains('active')) {
    modals.closeCurrent();
  } else {
    modals.show("menuModal");
  }
}

//bouton d'urgence
var emergencyButton = document.getElementById("emergencyButton");
var emergencyModal = document.getElementById("emergencyModal");

emergencyButton.addEventListener("click", function () {
  modals.show("emergencyModal", function () {
    menutoggle.classList.remove('active');
  });
  menutoggle.classList.toggle('active');
  menutoggle.classList.toggle('close-modal');
});


//ouvrir la modale de création de topic
var createButton = document.getElementById("create_button");
var topicModal = document.getElementById("create_topic");

createButton.addEventListener("click", function () {
  modals.show("create_topic", function () {
    menutoggle.classList.remove('active');
  });
  menutoggle.classList.toggle('active');
  menutoggle.classList.toggle('close-modal');
});

  
function applyTextStyle(e) {
  const textarea = document.getElementById('topic-content');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);

  if (e.target.id === "bold") {
    document.execCommand('bold', false, null);
  }
  if (e.target.id === "italic") {
    document.execCommand('italic', false, null);
  }
  if (e.target.id === "underline") {
    document.execCommand('underline', false, null);
  }
}

const toolbarButtons = document.querySelectorAll('.toolbar-button');
toolbarButtons.forEach(function (button) {
  button.addEventListener('click', applyTextStyle);
});




