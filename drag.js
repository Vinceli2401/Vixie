const vixie = document.getElementById("vixie");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

vixie.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - vixie.offsetLeft;
  offsetY = e.clientY - vixie.offsetTop;
  vixie.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    vixie.style.left = `${e.clientX - offsetX}px`;
    vixie.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  vixie.style.cursor = "grab";
});
