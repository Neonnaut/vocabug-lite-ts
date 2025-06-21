function assignSchemeClass(scheme: string): void {
    const mySchemes: string[] = ["light-mode", "dark-mode", "warm-mode"];
    const colourTarget = document.getElementById("colour-target");

    if (!colourTarget) return;

    for (let i = 0; i < mySchemes.length; i++) {
        if (scheme !== mySchemes[i]) {
            colourTarget.classList.remove(mySchemes[i]);
        } else {
            colourTarget.classList.add(scheme);
        }
    }
}

const storedScheme: string | null = localStorage.getItem('colourScheme');

if (storedScheme) {
    assignSchemeClass(storedScheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    assignSchemeClass('light-mode');
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event: MediaQueryListEvent): void => {
    if (!localStorage.hasOwnProperty('colourScheme')) {
        const scheme: string = event.matches ? "dark" : "light";
        const colourTarget = document.getElementById("colour-target");

        if (!colourTarget) return;

        if (scheme === "dark") {
            colourTarget.classList.remove("light-mode");
        } else if (scheme === "light") {
            colourTarget.classList.add("light-mode");
        }
    }
});

// If using jQuery, include its type definitions
$(window).on('load', function (): void {
    $("#main_menu").click(function (): void {
        window.location.href = './index.html';
    });
});