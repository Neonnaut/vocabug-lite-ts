// import { Fragment } from './rule.js';
// import Word from './word.js';
// import { SoundSystem, createText, invalidItemAndWeight } from './wordgen.js';\
import Logger from '../logger';

import { getCatSeg, GetTransform, makePercentage, extract_Value_and_Weight, resolve_nested_categories,
    valid_words_brackets, valid_category_brackets
 } from './utilities'

class Resolver {
    public logger: Logger;
    public num_of_words: number;

    public debug: boolean;
    public paragrapha: boolean;
    public sort_words: boolean;
    public capitalise_words: boolean;
    public remove_duplicates: boolean;
    public force_word_limit: boolean;
    public word_divider: string;

    public category_distribution: string;

    
    public categories: Map<string, [string[],number[]] >;
    private category_strings: Map<string, string>;

    public optionals_weight: number;
    public segments: Map<string, string>;
    public wordshape_distribution: string;
    public alphabet: string[];
    public wordshapes: [ string[], number[] ];
    private wordshape_string: string;
    public graphemes: string[];
    public transforms: Map<string, string>;

    private file_line_num = 0;

    constructor(
        logger: Logger,
        num_of_words_string: string,

        mode: string,
        sort_words: boolean,
        capitalise_words: boolean,
        remove_duplicates: boolean,
        force_word_limit: boolean,
        word_divider: string
    ) {
        this.logger = logger;

        if (num_of_words_string == '') {
            num_of_words_string = '100';
        }
        let num_of_words: number = Number(num_of_words_string);
        if (isNaN(num_of_words)) {
            this.logger.warn('Number of words was not a number. Genearating 100 words instead');
            num_of_words = 100;
        } else if (!Number.isInteger(num_of_words)) {
            this.logger.warn('Number of words was rounded to the nearest whole number');
            num_of_words = Math.ceil(num_of_words);
        }
        if ((num_of_words >= 1_000_000) || (num_of_words <= 1)) {
            this.logger.warn('Number of words was not between 1 and 1 000 000. Genearating 100 words instead');
            num_of_words = 100;
        }
        this.num_of_words = num_of_words;

        this.debug = (mode === 'debug');
        this.paragrapha = (mode === 'paragraph');
        this.sort_words = sort_words;
        this.capitalise_words = capitalise_words;
        this.remove_duplicates = remove_duplicates;
        this.force_word_limit = force_word_limit;
        this.word_divider = word_divider === "" ? ' ' : word_divider;

        if (this.paragrapha) {
            this.sort_words = false;
            this.capitalise_words = false;
            this.remove_duplicates = false;
            this.force_word_limit = false;
            this.word_divider = ' ';
        } else if (this.debug) {
            this.sort_words = false;
            this.capitalise_words = false;
            this.word_divider = '\n';
        }
        
        this.category_distribution = "flat";
        this.category_strings = new Map;
        this.categories = new Map;
        this.optionals_weight = 10;
        this.segments = new Map;
        this.wordshape_distribution = "flat";
        this.alphabet = [];
        this.wordshape_string = ""
        this.wordshapes = [ [], [] ];
        this.graphemes = [];
        this.transforms = new Map;
    }

    
    parse_file(file: string) {

        let transform_mode = false;
        let file_array = file.split('\n');

        for (; this.file_line_num < file_array.length; ++this.file_line_num) {
            let line = file_array[this.file_line_num];
            let line_value = '';

            line = line.replace(/;.*/u, '').trim(); // Remove comment!!

            if (line === '') { continue; } // Blank line !!

            if (transform_mode) {
                line_value = line

                if (line_value.startsWith("END")) {
                    transform_mode = false;
                    continue;
                }
                
                let [myName, field, valid] = GetTransform('→', line_value);

                if ( !valid ) {
                    this.logger.warn(`Malformed transform, (transforms must look like 'old → new') at line ${this.file_line_num + 1}`)
                }

                this.add_transform(myName, field);
                continue;
            }

            if (line.startsWith("category-distribution:")) {
                line_value = line.substring(22).trim().toLowerCase();

                if (line_value == "flat" || line_value == "gusein-zade" || line_value == "zipfian") {
                    this.category_distribution = line_value;
                } else {
                    throw new Error(`Invalid category-distribution option at line ${this.file_line_num + 1}`);
                }
            } else if (line.startsWith("num-syllables:")) {
                line_value = line.substring(14).trim();

                let syllableRange = line_value.split("-");
                if (syllableRange.length != 2) {
                    this.logger.warn(`No num-syllables value pair (it should look like 'min - max'. Min and max must be a number between 1 and 100) at line ${this.file_line_num + 1}`)
                    continue;
                }

            } else if (line.startsWith("wordshape-distribution:")) {
                line_value = line.substring(23).trim().toLowerCase();

                if (line_value == "flat" || line_value == "gusein-zade" || line_value == "zipfian") {
                    this.wordshape_distribution = line_value;
                } else {
                    throw new Error(`Invalid wordshape-distribution option at line ${this.file_line_num + 1}`);
                }

            } else if (line.startsWith("optionals-weight:")) {
                line_value = line.substring(17).trim();

                let optionals_weight = makePercentage(line_value);
                if (optionals_weight == null) {
                    this.logger.warn(`Invalid optionals-weight, (it should be a number between 1 and 100) at line ${this.file_line_num + 1}`);
                    continue;
                }

            } else if (line.startsWith("alphabet:")) {
                line_value = line.substring(9).trim();

                let alphabet = line_value.split(/[,\s]+/).filter(Boolean);
                if (alphabet.length == 0){
                    this.logger.warn(`Alphabet was empty at line ${this.file_line_num + 1}`);
                }
                this.alphabet = alphabet;

            } else if (line.startsWith("words:")) {
                line_value = line.substring(6).trim();

                if (line_value != "") {
                    this.wordshape_string = line_value;
                }

            } else if (line.startsWith("graphemes:")) {
                line_value = line.substring(10).trim();

                let graphemes = line_value.split(/[,\s]+/).filter(Boolean);
                if (graphemes.length == 0){
                    this.logger.warn(`Graphemes was empty at line ${this.file_line_num + 1}`);
                }
                this.graphemes = graphemes;

            } else if (line.startsWith("BEGIN transform:")) {
                transform_mode = true;

            } else {
                line_value = line;

                // Return word, field, valid, isCapital, hasDollarSign
                let [myName, field, valid, isCapital, hasDollarSign] = getCatSeg('=', line_value);

                if ( !valid || !isCapital ) {
                    continue;
                }
                if (hasDollarSign) {
                    // SEGMENTS !!!
                    this.add_segment(myName, field);
                } else {
                    // CATEGORIES !!!
                    this.add_category(myName, field);
                }
            }
        }
    }
    
    add_category(name:string, field:string) {
        this.category_strings.set(name, field);
    }
    add_segment(name:string, field:string) {
        this.segments.set(name, field);
    }

    set_wordshapes() {
        let result = [];
        let buffer = "";
        let insideBrackets = 0;

        if (!valid_words_brackets(this.wordshape_string)) {
            throw new Error("words had missmatched brackets");
        }

        for (let i = 0; i < this.wordshape_string.length; i++) {
            const char = this.wordshape_string[i];

            if (char === '[' || char === '(') {
                insideBrackets++;
            } else if (char === ']' || char === ')') {
                insideBrackets--;
            }

            if ((char === ' ' || char === ',') && insideBrackets === 0) {
                if (buffer.length > 0) {
                    result.push(buffer);
                    buffer = "";
                }
            } else {
                buffer += char;
            }
        }

        if (buffer.length > 0) {
            result.push(buffer);
        }

        let [resultStr, resultNum] = extract_Value_and_Weight(result, this.wordshape_distribution);
        for (let i = 0; i < resultStr.length; i++) {
            this.wordshapes[0].push(resultStr[i]);
            this.wordshapes[1].push(resultNum[i]); ///
        } 
    }

    add_transform(target:string, after:string) {
        this.transforms.set(target, after);
    }

    expand_categories() {
        for (const [key, value] of this.category_strings) {
            if (!valid_category_brackets(value)) {
                throw new Error("A category had missmatched brackets");
            }
            this.category_strings.set( key, this.recursiveExpansion(value, this.category_strings, true) );
        }



        for (const [key, value] of this.category_strings) {
            const newCategoryField: [string[],number[]] = resolve_nested_categories(value, this.category_distribution);
            this.categories.set(key, newCategoryField);
        }
    }

    expand_wordshape_segments() {
        this.wordshape_string = this.recursiveExpansion(this.wordshape_string, this.segments);

        // Remove dud segments
        this.wordshape_string = this.wordshape_string.replace(/\$[A-Z]/g, '❓');
    }

    expand_segments() {
        for (const [key, value] of this.segments) {
            this.segments.set(key, this.recursiveExpansion(value, this.segments, false));
        }
    }


    recursiveExpansion(
        input: string,
        mappings: Map<string, string>,
        encloseInBrackets: boolean = false
    ): string {
        function resolveMapping(str: string, history: string[]): string {
            let result = '';
            let i = 0;

            const mappingKeys: string[] = [...mappings.keys()].sort((a, b) => b.length - a.length);

            while (i < str.length) {
                let matched = false;

                for (const key of mappingKeys) {
                    if (str.startsWith(key, i)) {
                        if (history.includes(key)) {
                            result += '🔄'; // Cycle detected
                        } else {
                            const mappedValue: string = mappings.get(key) || '';
                            let resolved = resolveMapping(mappedValue, [...history, key]);
                            if (encloseInBrackets) {
                                resolved = `[${resolved}]`;
                            }
                            result += resolved;
                        }
                        i += key.length;
                        matched = true;
                        break;
                    }
                }

                if (!matched) {
                    result += str[i];
                    i++;
                }
            }

            return result;
        }

        return resolveMapping(input, []);
    }

    create_record(): void {
        let categories = [];
        for (const [key, value] of this.categories) {
            let catField:string[] = [];
            for (let i = 0; i < value[0].length; i++) {
                catField.push(`${value[0][i]}:${value[1][i]}`);
            }
            const category_field:string = `${catField.join(', ')}`;

            categories.push(`  ${key} = ${category_field}`);
        }

        let segments = [];
        for (const [key, value] of this.segments) {
            segments.push(`  ${key} = ${value}`);
        }

        let wordshapes = [];
        for (let i = 0; i < this.wordshapes[0].length; i++) {
            wordshapes.push(`${this.wordshapes[0][i]}:${this.wordshapes[1][i]}`);
        }

        let transforms = [];
        for (const [key, value] of this.transforms) {
            transforms.push(`  ${key} → ${value}`);
        }

        this.logger.silent_info(
            `~ OPTIONS ~\n` +
            `Num of words:      ` + this.num_of_words + 
            `\nDebug:             ` + this.debug + 
            `\nParagrapha:        ` + this.paragrapha +
            `\nRemove duplicates: ` + this.remove_duplicates +
            `\nForce word limit:  ` + this.force_word_limit +
            `\nSort words:        ` + this.sort_words +
            `\nCapitalise words:  ` + this.capitalise_words +
            `\nWord divider:      "` + this.word_divider + `"` +
            `\n\n~ FILE ~` +
            `\nSegments {\n` + segments.join('\n') + `\n}` +
            `\nOptionals-weight:       ` + this.optionals_weight +
            `\nCategory-distribution:  ` + this.category_distribution +
            `\nCategories {\n` + categories.join('\n') + `\n}` +
            `\nWordshape-distribution: ` + this.wordshape_distribution +
            `\nWordshapes:             ` + wordshapes.join(', ') + `\n}` +
            `\nTransforms {\n` + transforms.join('\n') + `\n}` +
            `\nGraphemes:              ` + this.graphemes.join(', ') +
            `\nAlphabet:               ` + this.alphabet.join(', ')

        );
    }


}

export default Resolver;