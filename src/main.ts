import MyWorker from './worker?worker';

const w = new MyWorker();

$(window).on('load', function () {
    // On load up load last Definition
    if (localStorage.getItem('vocabug-lite')) {
        const gotLocalStorage = JSON.parse(localStorage.getItem('vocabug-lite') || '[]') as [string, string];
        if (gotLocalStorage.length === 2) {
            fileToInterface(gotLocalStorage[0]);
            setFilename(gotLocalStorage[1]);
        }
    }

    // Generate button
    document.getElementById("generate-words")?.addEventListener("click", function () {
        const generateButton = this as HTMLButtonElement;
        generateButton.disabled = true;

        let myFile = makeFile();

        try {
            w.postMessage({
                file: myFile,
                num_of_words: (document.getElementById('num-of-words') as HTMLInputElement)?.value || "",
                mode: (document.querySelector('input[name="mode-type"]:checked') as HTMLInputElement)?.value || "",
                sort_words: (document.getElementById('sort-words') as HTMLInputElement)?.checked || false,
                capitalise_words: (document.getElementById('capitalise-words') as HTMLInputElement)?.checked || false,
                remove_duplicates: (document.getElementById('remove-duplicates') as HTMLInputElement)?.checked || false,
                force_words: (document.getElementById('force-words') as HTMLInputElement)?.checked || false,
                word_divider: (document.getElementById('word-divider') as HTMLInputElement)?.value || ""
            });
        } catch (e) {
            generateButton.disabled = false;
            alert(e);
        }
    });

    // After generating words 
    w.onmessage = (e: MessageEvent) => {
        const outputWordsField = document.getElementById('voc-output-words-field') as HTMLDivElement;
        const outputMessage = document.getElementById('voc-output-message') as HTMLDivElement;
        const filenameInput = document.getElementById('file-name') as HTMLInputElement;
        const generateWordsButton = document.getElementById("generate-words") as HTMLButtonElement;

        if (outputWordsField) {
            // Transfer words to the output
            outputWordsField.innerHTML = e.data.words;
            outputWordsField.focus();
        }

        const filename = filenameInput?.value || "";

        let output_message_html = '';

        if (e.data.warning_message.length != 0) {
            for (const message of e.data.warning_message) {
                output_message_html += `<p class='warning-message'>${message}</p>`;
            }
        }
        if (e.data.error_message.length != 0) {
            for (const message of e.data.error_message) {
                output_message_html += `<p class='error-message'>${message}</p>`;
            }
        }
        if (e.data.info_message.length != 0) {
            for (const message of e.data.info_message) {
                output_message_html += `<p class='info-message'>${message}</p>`;
            }
        }
        outputMessage.innerHTML = output_message_html;

        // Store file contents in local storage to be retrieved on page refresh
        localStorage.setItem('vocabug-lite', JSON.stringify([e.data.file, filename]));

        if (generateWordsButton) {
            generateWordsButton.disabled = false;
        }
    };

    // Copy results button
    document.getElementById("output-words-copy")?.addEventListener("click", () => {
        const outputWordsField = document.getElementById("voc-output-words-field") as HTMLTextAreaElement;
        
        if (outputWordsField && outputWordsField.value !== "") {
            // Select text for deprecated way and aesthetics
            outputWordsField.select();
            outputWordsField.setSelectionRange(0, 99999); // For mobile devices
            outputWordsField.focus();

            if (!navigator.clipboard) {
                document.execCommand("copy"); // Deprecated way
            } else {
                navigator.clipboard.writeText(outputWordsField.value);
            }
        }
    });

    // Clear button
    document.getElementById("voc-clear-editor")?.addEventListener("click", () => {
        if (window.confirm("Clear ALL FIELDS and GENERATED WORDS?")) {
            setFilename('');
            clearFields();
            clearResults();
        }
    });

    // Mode buttons
    document.querySelectorAll("input[name='mode-type']").forEach((element) => {
        element.addEventListener("click", () => {
            const wordListMode = document.getElementById("word-list-mode") as HTMLInputElement;
            const sortWords = document.getElementById("sort-words") as HTMLInputElement;
            const capitaliseWords = document.getElementById("capitalise-words") as HTMLInputElement;
            const removeDuplicates = document.getElementById("remove-duplicates") as HTMLInputElement;
            const wordDivider = document.getElementById("word-divider") as HTMLInputElement;
            const forceWords = document.getElementById("force-words") as HTMLInputElement;

            if (wordListMode?.checked) {
                if (sortWords) sortWords.disabled = false;
                if (capitaliseWords) capitaliseWords.disabled = false;
                if (removeDuplicates) removeDuplicates.disabled = false;
                if (wordDivider) wordDivider.disabled = false;
                if (forceWords) forceWords.disabled = false;
            } else {
                [sortWords, capitaliseWords, removeDuplicates, wordDivider, forceWords].forEach(element => {
                    if (element) element.disabled = true;
                });
            }
        });
    });

    // Load file button
    document.getElementById("load-file")?.addEventListener("click", () => {
        const input = document.createElement('input');
        input.type = 'file';

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.readAsText(file);
            reader.onloadend = () => {
                const fileContent = reader.result as string;
                const filename = file.name.replace(/\.[^/.]+$/, "");
                
                setFilename(filename);
                fileToInterface(fileContent);

                localStorage.setItem('vocabug-lite', JSON.stringify([fileContent, filename]));
            };
        };
        input.click();
    });

    // Save file button
    document.getElementById("save-file")?.addEventListener("click", () => {
        const link = document.createElement("a");
        const fileContent = makeFile();
        const fileBlob = new Blob([fileContent], { type: 'text/plain' });
        link.href = URL.createObjectURL(fileBlob);

        const filenameInput = document.getElementById("file-name") as HTMLInputElement;
        let filename = filenameInput?.value || "vocabug";

        link.download = `${filename}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);

        localStorage.setItem('vocabug-lite', JSON.stringify([fileContent, filename]));
    });

    // Show keyboard toggle
    document.getElementById("show-keyboard")?.addEventListener("click", () => {
        const keyboardTable = document.getElementById("voc-keyboard-table") as HTMLDivElement;
        const checkbox = document.getElementById('show-keyboard') as HTMLInputElement;
        
        if (keyboardTable && checkbox) {
            keyboardTable.style.display = checkbox.checked ? "block" : "none";
        }
    });

    // IPA buttons
    document.querySelectorAll(".ipa-button").forEach((button) => {
        button.addEventListener("mousedown", (e) => {
            e.preventDefault();

            const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
            if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
                const start = activeElement.selectionStart ?? 0;
                const end = activeElement.selectionEnd ?? 0;
                const beforeText = activeElement.value.substring(0, start);
                const afterText = activeElement.value.substring(end);
                const charToInsert = (button as HTMLElement).getAttribute("value") || "";

                activeElement.value = beforeText + charToInsert + afterText;
                activeElement.selectionStart = activeElement.selectionEnd = start + charToInsert.length;
                activeElement.focus();
            }
        });
    });

    // Delete button
    $(document).on("click", ".voca-delete", function () {
        const currentDiv = $(this).closest("div"); // Find the closest parent div
        const parentDiv = currentDiv.parent(); // Get the next parent div

        currentDiv.remove(); // Remove the current div
        parentDiv.remove(); // Remove the parent div
    });

    // Add category button
    document.getElementById("voc-add-category")?.addEventListener("click", () => {
        const container = document.getElementById("category-container") as HTMLDivElement;
        if (!container) return;

        // Get next available letter
        const selectElements = container.querySelectorAll("select");
        const selectedValues = Array.from(selectElements)
            .map(select => (select as HTMLSelectElement).value);

        const myOption = getNextAvailableLetter(selectedValues); // Get next available letter

        // Create main wrapper div
        const wrapperDiv = document.createElement("div");
        wrapperDiv.className = "flex flex-col gap-2";

        // Create inner div
        const innerDiv = document.createElement("div");
        innerDiv.className = "flex items-center gap-2";

        // Create select element
        const selectElement = document.createElement("select");
        selectElement.name = "category-name";

        for (let i = 65; i <= 90; i++) {
            const option = document.createElement("option");
            option.value = String.fromCharCode(i);
            option.textContent = String.fromCharCode(i);
            option.selected = myOption === String.fromCharCode(i);
            selectElement.appendChild(option);
        }

        // Create input field
        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.spellcheck = false;
        inputElement.className = "w-full monospace";
        inputElement.name = "category-field";

        // Create delete button
        const buttonElement = document.createElement("button");
        buttonElement.className = "voca-delete";
        buttonElement.innerHTML = '<i class="fa fa-trash"></i>';

        // Append all elements
        innerDiv.appendChild(selectElement);
        innerDiv.appendChild(inputElement);
        innerDiv.appendChild(buttonElement);
        wrapperDiv.appendChild(innerDiv);
        container.appendChild(wrapperDiv);
    });

    // Add segments button
    document.getElementById("voc-add-segment")?.addEventListener("click", () => {
        const container = document.getElementById("segment-container") as HTMLDivElement;
        if (!container) return;

        // Get next available letter
        const selectElements = container.querySelectorAll("select");
        const selectedValues = Array.from(selectElements)
            .map(select => (select as HTMLSelectElement).value.substring(1));

        const myOption = getNextAvailableLetter(selectedValues); // Get next available letter

        // Create main wrapper div
        const wrapperDiv = document.createElement("div");
        wrapperDiv.className = "flex flex-col gap-2";

        // Create inner div
        const innerDiv = document.createElement("div");
        innerDiv.className = "flex items-center gap-2";

        // Create select element
        const selectElement = document.createElement("select");
        selectElement.name = "segment-name";

        for (let i = 65; i <= 90; i++) {
            const option = document.createElement("option");
            option.value = `$${String.fromCharCode(i)}`;
            option.textContent = `$${String.fromCharCode(i)}`;
            option.selected = myOption === String.fromCharCode(i);
            selectElement.appendChild(option);
        }

        // Create input field
        const inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.spellcheck = false;
        inputElement.className = "w-full monospace";
        inputElement.name = "segment-field";

        // Create delete button
        const buttonElement = document.createElement("button");
        buttonElement.className = "voca-delete";
        buttonElement.innerHTML = '<i class="fa fa-trash"></i>';

        // Append all elements
        innerDiv.appendChild(selectElement);
        innerDiv.appendChild(inputElement);
        innerDiv.appendChild(buttonElement);
        wrapperDiv.appendChild(innerDiv);
        container.appendChild(wrapperDiv);
    });


    // Add transform button
    document.getElementById("voc-add-transform")?.addEventListener("click", () => {
        const container = document.getElementById("transform-container") as HTMLDivElement;
        if (!container) return;

        const newElement = document.createElement("div");
        newElement.innerHTML = `
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <input name="transform-target" type="text" spellcheck="false" autocomplete="off" class="w-full monospace">
                    <a>→</a>
                    <input name="transform-after" type="text" spellcheck="false" autocomplete="off" class="w-full monospace">
                    <button class="voca-delete"><i class="fa fa-trash"></i></button>
                </div>
            </div>
        `;

        container.appendChild(newElement);
    });
});


function getNextAvailableLetter(letters: string[]): string {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""); // Full alphabet
    const usedLetters = new Set(letters); // Convert list to a Set for fast lookup

    for (let letter of alphabet) {
        if (!usedLetters.has(letter)) {
            return letter; // Return the first unused letter
        }
    }
    return 'Z'; // Return zed if all letters are used
}


function validateString(str: string): [boolean, boolean] {
    const regex = /^[A-Z]$|^\$[A-Z]$/;
    const hasDollarSign = str.includes("$");

    return [regex.test(str), hasDollarSign];
}

function divideString(divider: string, input: string): [string, string, boolean, boolean, boolean] {
    if (input === "" || divider === "") {
        return ['', '', false, false, false]; // Handle invalid inputs
    }

    const divided = input.split(divider);
    if (divided.length !== 2) {
        return ['', '', false, false, false]; // Ensure division results in exactly two parts
    }

    const word = divided[0].trim();
    const field = divided[1].trim();
    if (word === "" || field === "") {
        return ['', '', false, false, false]; // Handle empty parts
    }

    const [isValid, hasDollarSign] = validateString(word);

    return [word, field, true, isValid, hasDollarSign]; // Return word, field, valid, isCapital, hasDollarSign
}


const makeFile = (): string => {
    // category_distribution
    const categoryDistribution = (document.getElementById('category-distribution') as HTMLTextAreaElement).value;

    // category containers
    const categoryContainer = document.getElementById("category-container")!;
    let categories = '';
    categoryContainer.querySelectorAll(".flex.items-center").forEach((item) => {
        const categoryName = item.querySelector("select[name='category-name']") as HTMLSelectElement;
        const categoryField = item.querySelector("input[name='category-field']") as HTMLInputElement;

        if (categoryName?.value && categoryField?.value) {
            categories += `${categoryName.value} = ${categoryField.value}\n`;
        }
    });

    // segments containers
    const segmentContainer = document.getElementById("segment-container")!;
    let segments = '';
    segmentContainer.querySelectorAll(".flex.items-center").forEach((item) => {
        const segmentName = item.querySelector("select[name='segment-name']") as HTMLSelectElement;
        const segmentField = item.querySelector("input[name='segment-field']") as HTMLInputElement;

        if (segmentName?.value && segmentField?.value) {
            segments += `${segmentName.value} = ${segmentField.value}\n`;
        }
    });

    // other inputs
    const wordshapeDistribution = (document.getElementById('word-shape-distribution') as HTMLInputElement).value;
    const optionalsWeight = (document.getElementById('optionals-weight') as HTMLInputElement).value;
    const alphabet = (document.getElementById('alphabet') as HTMLInputElement).value;
    const wordshapes = (document.getElementById('word-shapes') as HTMLInputElement).value;
    const graphemes = (document.getElementById('graphemes') as HTMLInputElement).value;

    // transforms containers
    const transformContainer = document.getElementById("transform-container")!;
    let transforms = '';
    transformContainer.querySelectorAll(".flex.items-center").forEach((item) => {
        const transformTarget = item.querySelector("input[name='transform-target']") as HTMLInputElement;
        const transformAfter = item.querySelector("input[name='transform-after']") as HTMLInputElement;

        if (transformTarget?.value && transformAfter?.value) {
            transforms += `${transformTarget.value} → ${transformAfter.value}\n`;
        }
    });

    // assembling file content
    let file = "";
    if (categoryDistribution) file += `category-distribution: ${categoryDistribution}\n`;
    if (categories.trim()) file += `${categories.trim()}\n`;
    if (segments.trim()) file += `${segments.trim()}\n`;
    if (wordshapeDistribution) file += `wordshape-distribution: ${wordshapeDistribution}\n`;
    if (optionalsWeight) file += `optionals-weight: ${optionalsWeight}\n`;
    if (alphabet) file += `alphabet: ${alphabet}\n`;
    if (wordshapes) file += `words: ${wordshapes}\n`;
    if (graphemes) file += `graphemes: ${graphemes}\n`;
    if (transforms.trim()) file += `BEGIN transform:\n${transforms.trim()}\nEND\n`;

    return file;
};

const fileToInterface = (file: string): void => {
    let myArray: string[] = file.split("\n");
    let transformMode = false;

    const categoryContainer = document.getElementById("category-container") as HTMLDivElement;
    categoryContainer.innerHTML = ''; // Clear existing categories

    const segmentContainer = document.getElementById("segment-container") as HTMLDivElement;
    segmentContainer.innerHTML = ''; // Clear existing segments

    const transformContainer = document.getElementById("transform-container") as HTMLDivElement;
    transformContainer.innerHTML = ''; // Clear existing transforms

    for (let i = 0; i < myArray.length; i++) {
        let line = myArray[i].trim();
        line = line.replace(/;.*/u, '').trim(); // Remove comments
        if (line === '') continue;

        if (transformMode) {
            
            // Handle transform lines
            const [myName, field, valid, _isCapital, _hasDollarSign] = divideString('→', line);

            if (!valid) {
                return; // Use return instead of continue for better function control
            }

            // Create main wrapper div
            const wrapperDiv = document.createElement("div");
            wrapperDiv.className = "flex flex-col gap-2";

            // Create inner div
            const innerDiv = document.createElement("div");
            innerDiv.className = "flex items-center gap-2";

            // Create target input field
            const targetElement = document.createElement("input") as HTMLInputElement;
            targetElement.type = "text";
            targetElement.className = "w-full monospace";
            targetElement.name = "transform-target";
            targetElement.value = myName;

            // Create arrow display
            const myArrow = document.createElement("a");
            myArrow.innerHTML = "→";

            // Create after input field
            const afterElement = document.createElement("input") as HTMLInputElement;
            afterElement.type = "text";
            afterElement.className = "w-full monospace";
            afterElement.name = "transform-after";
            afterElement.value = field;

            // Create delete button
            const buttonElement = document.createElement("button") as HTMLButtonElement;
            buttonElement.className = "voca-delete";
            buttonElement.innerHTML = '<i class="fa fa-trash"></i>';

            // Append all elements
            innerDiv.appendChild(targetElement);
            innerDiv.appendChild(myArrow);
            innerDiv.appendChild(afterElement);
            innerDiv.appendChild(buttonElement);
            wrapperDiv.appendChild(innerDiv);

            // Ensure `transformContainer` exists before appending
            const transformContainer = document.getElementById("transform-container") as HTMLDivElement | null;
            if (transformContainer) {
                transformContainer.appendChild(wrapperDiv);
            }

        } else {
            if (line.startsWith("category-distribution:")) {
                let theSelected: string = "flat";
                const value = line.substring(22).trim().toLowerCase();

                if (value === "gusein-zade") {
                    theSelected = "gusein-zade";
                } else if (value === "zipfian") {
                    theSelected = "zipfian";
                }

                const categoryDistribution = document.getElementById('category-distribution') as HTMLSelectElement | null;
                if (categoryDistribution) {
                    for (const option of Array.from(categoryDistribution.options)) {
                        if (theSelected === option.value) {
                            option.selected = true;
                        }
                    }
                }
            } else if (line.startsWith("optionals-weight:")) {
                const value = line.substring(17).trim();
                const optionalsWeight = document.getElementById('optionals-weight') as HTMLInputElement | null;

                if (optionalsWeight) {
                    optionalsWeight.value = is_a_percentage(value) ? value : '10';
                }

            } else if (line.startsWith("wordshape-distribution:")) {
                let theSelected = "flat";
                const value = line.substring(23).trim().toLowerCase();

                if (value === "gusein-zade") {
                    theSelected = "gusein-zade";
                } else if (value === "zipfian") {
                    theSelected = "zipfian";
                }

                const options = document.getElementById('word-shape-distribution') as HTMLSelectElement;
                if (options) {
                    for (const option of options) {
                        if (theSelected === option.value) {
                            option.selected = true;
                        }
                    }
                }

            } else if (line.startsWith("alphabet:")) {
                const value = line.substring(9).trim();
                const alphabet = document.getElementById('alphabet') as HTMLInputElement | null;

                if (alphabet && value) {
                    alphabet.value = value;
                }

            } else if (line.startsWith("words:")) {
                const value = line.substring(6).trim();
                const wordShapes = document.getElementById('word-shapes') as HTMLInputElement | null;

                if (wordShapes && value) {
                    wordShapes.value = value;
                }

            } else if (line.startsWith("graphemes:")) {
                const value = line.substring(10).trim();
                const graphemes = document.getElementById('graphemes') as HTMLInputElement | null;

                if (graphemes && value) {
                    graphemes.value = value;
                }

            } else if (line.startsWith("BEGIN transform:")) {
                transformMode = true;

            } else if (line.startsWith("END")) {
                transformMode = false;
            } else {

                // Return word, field, valid, isCapital, hasDollarSign
                let [myName, field, valid, isCapital, hasDollarSign] = divideString('=', line);


                if ( !valid || !isCapital ) {

                } else if (hasDollarSign) {

                    // Create main wrapper div
                    const wrapperDiv = document.createElement("div");
                    wrapperDiv.className = "flex flex-col gap-2";

                    // Create inner div
                    const innerDiv = document.createElement("div");
                    innerDiv.className = "flex items-center gap-2";

                    // Create select element
                    const selectElement = document.createElement("select");
                    selectElement.name = "segment-name";
                    for (let i = 65; i <= 90; i++) {
                        const checker:string = '$'+String.fromCharCode(i);
                        if (myName === checker) {
                            const optionA = document.createElement("option");
                            optionA.selected = true;
                            optionA.value = checker; // Changed from "A" to "C"
                            optionA.textContent = checker;
                            selectElement.appendChild(optionA);
                        } else {
                            const optionA = document.createElement("option");
                            optionA.value = checker; // Changed from "A" to "C"
                            optionA.textContent = checker;
                            selectElement.appendChild(optionA);
                        }
                    }
                    

                    // Create input field
                    const inputElement = document.createElement("input");
                    inputElement.type = "text";
                    inputElement.spellcheck = false
                    inputElement.className = "w-full monospace";
                    inputElement.name = "segment-field"
                    inputElement.value = field;

                    // Create delete button
                    const buttonElement = document.createElement("button");
                    buttonElement.className = "voca-delete";
                    buttonElement.innerHTML = '<i class="fa fa-trash"></i>';

                    // Append all elements
                    innerDiv.appendChild(selectElement);
                    innerDiv.appendChild(inputElement);
                    innerDiv.appendChild(buttonElement);
                    wrapperDiv.appendChild(innerDiv);
                    segmentContainer.appendChild(wrapperDiv);

                } else {
                    // CATEGORIES !!!

                    // Create main wrapper div
                    const wrapperDiv = document.createElement("div");
                    wrapperDiv.className = "flex flex-col gap-2";

                    // Create inner div
                    const innerDiv = document.createElement("div");
                    innerDiv.className = "flex items-center gap-2";

                    // Create select element
                    const selectElement = document.createElement("select");
                    selectElement.name = "category-name";
                    for (let i = 65; i <= 90; i++) {
                        if (myName === String.fromCharCode(i)) {
                            const optionA = document.createElement("option");
                            optionA.selected = true;
                            optionA.value = String.fromCharCode(i); // Changed from "A" to "C"
                            optionA.textContent = String.fromCharCode(i);
                            selectElement.appendChild(optionA);
                        } else {
                            const optionA = document.createElement("option");
                            optionA.value = String.fromCharCode(i); // Changed from "A" to "C"
                            optionA.textContent = String.fromCharCode(i);
                            selectElement.appendChild(optionA);
                        }
                    }

                    // Create input field
                    const inputElement = document.createElement("input");
                    inputElement.type = "text";
                    inputElement.spellcheck = false
                    inputElement.className = "w-full monospace";
                    inputElement.name = "category-field"
                    inputElement.value = field;

                    // Create delete button
                    const buttonElement = document.createElement("button");
                    buttonElement.className = "voca-delete";
                    buttonElement.innerHTML = '<i class="fa fa-trash"></i>';

                    // Append all elements
                    innerDiv.appendChild(selectElement);
                    innerDiv.appendChild(inputElement);
                    innerDiv.appendChild(buttonElement);
                    wrapperDiv.appendChild(innerDiv);
                    categoryContainer.appendChild(wrapperDiv);
                }
            }
        }
    }
}


function clearFields(): void {
    (document.getElementById("category-distribution") as HTMLSelectElement).selectedIndex = 1;

    document.getElementById('category-container')!.innerHTML = `
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <select name="category-name">
                ${Array.from({ length: 26 }, (_, i) => 
                    `<option value="${String.fromCharCode(65 + i)}" ${
                        String.fromCharCode(65 + i) === "C" ? 'selected' : ''
                    }>${String.fromCharCode(65 + i)}</option>`
                ).join("")}
              </select>
              <input type="text" name="category-field" spellcheck="false" autocomplete="off" class="w-full monospace">
              <button class="voca-delete"><i class="fa fa-trash"></i></button>
            </div>
        </div>`;

    document.getElementById('segment-container')!.innerHTML = ``;

    (document.getElementById("word-shape-distribution") as HTMLSelectElement).selectedIndex = 2;
    (document.getElementById('word-shapes') as HTMLInputElement).value = "";
    (document.getElementById('optionals-weight') as HTMLInputElement).value = "10";
    (document.getElementById('alphabet') as HTMLInputElement).value = "";
    (document.getElementById('graphemes') as HTMLInputElement).value = "";
    document.getElementById('voc-output-message')!.innerHTML = "";
    document.getElementById('transform-container')!.innerHTML = "";
}

function clearResults(): void {
    (document.getElementById('voc-output-message') as HTMLInputElement).value = "";
    document.getElementById('voc-output-words-field')!.innerHTML = "";
}

function setFilename(filename: string): void {
    (document.getElementById('file-name') as HTMLInputElement).value = filename;
}


const is_a_percentage = (str: string): boolean => {
    const num = Number(str);
    return !isNaN(num) && num >= 1 && num <= 100;
};

