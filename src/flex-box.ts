window.addEventListener("load", () => {
  const flexies = document.querySelectorAll<HTMLTextAreaElement>(".flex-box");

  flexies.forEach((textarea) => {
    const resize = (): void => {
      if (textarea.value === "") {
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