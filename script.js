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
  const resultDiv = document.getElementById("result");
  const chars = document.querySelectorAll(".char");
  let draggedElements = [];
  let offsetX, offsetY;
  let isDragging = false;
  let isSelecting = false;
  let startX, startY;

  const containerRect = resultDiv.getBoundingClientRect();

  chars.forEach((char) => {
    char.addEventListener("click", (e) => {
      if (e.ctrlKey) {
        char.classList.toggle("selected");
        e.preventDefault();
      }
    });

    char.addEventListener("mousedown", (e) => {
      if (!e.ctrlKey) {
        isDragging = true;
        draggedElements = char.classList.contains("selected")
          ? Array.from(chars).filter((c) => c.classList.contains("selected"))
          : [char];

        const rect = char.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        draggedElements.forEach((el) => {
          el.style.zIndex = 1000;
        });
      }
    });
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging && draggedElements.length > 0) {
      const x = e.clientX - containerRect.left - offsetX;
      const y = e.clientY - containerRect.top - offsetY;

      draggedElements.forEach((el, index) => {
        el.style.position = "absolute";
        el.style.left = x + index * 20 + "px";
        el.style.top = y + "px";
      });
    } else if (isSelecting) {
      updateSelectionRect(e);
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (isDragging && draggedElements.length > 0) {
      draggedElements.forEach((el) => (el.style.visibility = "hidden"));
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const targetChar = target && target.closest(".char");
      draggedElements.forEach((el) => (el.style.visibility = "visible"));

      if (targetChar && !draggedElements.includes(targetChar)) {
        const parent = resultDiv;
        const targetIndex = Array.from(parent.children).indexOf(targetChar);
        const firstDragged = draggedElements[0];
        const draggedIndex = Array.from(parent.children).indexOf(firstDragged);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          if (draggedElements.length === 1) {
            const temp = firstDragged.cloneNode(true);
            parent.replaceChild(temp, targetChar);
            parent.replaceChild(firstDragged, targetChar);
            parent.replaceChild(targetChar, temp);
          } else {
            if (draggedIndex < targetIndex) {
              draggedElements
                .reverse()
                .forEach((el) =>
                  parent.insertBefore(el, targetChar.nextSibling)
                );
            } else {
              draggedElements
                .reverse()
                .forEach((el) => parent.insertBefore(el, targetChar));
            }
          }
        }
      }

      draggedElements.forEach((el) => {
        el.style.position = "relative";
        el.style.left = "0";
        el.style.top = "0";
        el.style.zIndex = "0";
      });
      draggedElements = [];
      isDragging = false;
    } else if (isSelecting) {
      endSelection();
    }
  });

  resultDiv.addEventListener("mousedown", (e) => {
    if (!e.ctrlKey && !e.target.classList.contains("char")) {
      isSelecting = true;
      startX = e.clientX - containerRect.left;
      startY = e.clientY - containerRect.top;
      createSelectionRect();
    }
  });

  function createSelectionRect() {
    const rect = document.createElement("div");
    rect.className = "selection-rect";
    resultDiv.appendChild(rect);
  }

  function updateSelectionRect(e) {
    const rect = document.querySelector(".selection-rect");
    if (!rect) return;

    const currentX = e.clientX - containerRect.left;
    const currentY = e.clientY - containerRect.top;
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    rect.style.left = left + "px";
    rect.style.top = top + "px";
    rect.style.width = width + "px";
    rect.style.height = height + "px";

    chars.forEach((char) => {
      const charRect = char.getBoundingClientRect();
      const charLeft = charRect.left - containerRect.left;
      const charTop = charRect.top - containerRect.top;
      const charRight = charLeft + charRect.width;
      const charBottom = charTop + charRect.height;

      if (
        isOverlapping(
          {
            left: charLeft,
            top: charTop,
            right: charRight,
            bottom: charBottom,
          },
          { left, top, right: left + width, bottom: top + height }
        )
      ) {
        char.classList.add("selected");
      } else {
        char.classList.remove("selected");
      }
    });
  }

  function endSelection() {
    const rect = document.querySelector(".selection-rect");
    if (rect) rect.remove();
    isSelecting = false;
  }

  function isOverlapping(rect1, rect2) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }
}
