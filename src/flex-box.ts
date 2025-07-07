window.addEventListener("load", () => {
  const flexBoxes = document.querySelectorAll<HTMLTextAreaElement>(".flex-box");

  flexBoxes.forEach((textarea) => {
    const resize = (): void => {
      if (textarea.value.trim() === "") {
        textarea.style.height = "calc(1.2em * 2)";
      } else {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    textarea.addEventListener("input", resize);
    window.addEventListener("load", resize); // Adjust height on page load
  });
});