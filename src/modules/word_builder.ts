// import { Fragment } from './rule.js';
import Word from './word.js';
// import { SoundSystem, createText, invalidItemAndWeight } from './wordgen.js';\
import Logger from './logger.js';

import { weightedRandomPick, resolve_wordshape_sets } from './utilities'

class Word_Builder {
    public logger: Logger;
    public categories: Map<string, [string[],number[]] >;
    public wordshapes: [ string[], number[] ];
    public wordshape_distribution: string;
    public optionals_weight: number;

    constructor(
        logger: Logger,
        categories: Map<string, [string[],number[]] >,
        wordshapes: [ string[], number[] ],
        wordshape_distribution: string,
        optionals_weight: number,
        debug: boolean,
        capitalise_words: boolean
    ) {
        this.logger = logger;
        this.categories = categories;
        this.wordshapes = wordshapes;
        this.wordshape_distribution = wordshape_distribution;
        this.optionals_weight = optionals_weight;

        Word.debug = debug;
        Word.capitalise_words = capitalise_words;
    }

    make_word() : Word {
        // skeleton word looks like `CV(@, !)CVF[@, !]`
        const skeleton_word:string | undefined = weightedRandomPick(this.wordshapes[0], this.wordshapes[1]);
        if (skeleton_word === undefined) {
            throw new Error('undefined')
        }

        // baby word looks like `CVCVF!`
        const baby_word:string = resolve_wordshape_sets(skeleton_word, this.wordshape_distribution, this.optionals_weight);

        // adult word looks like `tacan!`. ready to be transformed and added to text
        let adult_word:string = "";
        for (let i = 0; i < baby_word.length; i++) { // going through each char of baby
            let new_char:string = baby_word[i];
            if (!new_char){
                throw new Error("")
            }
            for (const [category_key, category_field] of this.categories) { //going through C = [[a, b, c], [1, 2, 3]]
                if (category_key == new_char) {
                    new_char = weightedRandomPick(category_field[0], category_field[1])
                    break;
                }
            }
            adult_word += new_char
        }
        return new Word(skeleton_word, baby_word, adult_word);
    }
}

export default Word_Builder;