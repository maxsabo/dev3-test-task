document.getElementById("textForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const input = document.getElementById("textInput").value;
  displayText(input);
});

function displayText(text) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  text.split("").forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.className = "char";
    span.dataset.index = index;
    resultDiv.appendChild(span);
  });

  setupCharInteractions();
}

function setupCharInteractions() {
  const chars = document.querySelectorAll(".char");
  let draggedElement = null;

  chars.forEach((char) => {
    char.addEventListener("click", (e) => {
      if (e.ctrlKey) {
        char.classList.toggle("selected");
      }
    });

    char.addEventListener("mousedown", (e) => {
      if (!e.ctrlKey) {
        draggedElement = char;
        char.style.zIndex = 1000;
      }
    });
  });

  document.addEventListener("mousemove", (e) => {
    if (draggedElement) {
      draggedElement.style.position = "absolute";
      draggedElement.style.left = e.pageX - 5 + "px";
      draggedElement.style.top = e.pageY - 5 + "px";
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (draggedElement) {
      const target = e.target.closest(".char");
      if (target && target !== draggedElement) {
        const parent = draggedElement.parentElement;
        const draggedIndex = parseInt(draggedElement.dataset.index);
        const targetIndex = parseInt(target.dataset.index);

        if (draggedIndex < targetIndex) {
          parent.insertBefore(draggedElement, target.nextSibling);
        } else {
          parent.insertBefore(draggedElement, target);
        }
      }

      draggedElement.style.position = "relative";
      draggedElement.style.left = "0";
      draggedElement.style.top = "0";
      draggedElement.style.zIndex = "0";
      draggedElement = null;
    }
  });
}
