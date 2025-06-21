// import { Fragment } from './rule.js';
// import Word from './word.js';
// import { SoundSystem, createText, invalidItemAndWeight } from './wordgen.js';\
import Logger from '../logger';

import { weightedRandomPick } from './utilities'

class Word_Builder {
    public logger: Logger;
    public categories: Map<string, [string[],number[]] >;
    public wordshapes: [ string[], number[] ];

    constructor(
        logger: Logger,
        categories: Map<string, [string[],number[]] >,
        wordshapes: [ string[], number[] ]
    ) {
        this.logger = logger;
        this.categories = categories;
        this.wordshapes = wordshapes;
    }

    make_word() : string | undefined {
        const skeleton_word:string | undefined = weightedRandomPick(this.wordshapes[0], this.wordshapes[1]);
        if (skeleton_word === undefined) {
            throw new Error('undefined')
        }

        return skeleton_word;
    }


}

export default Word_Builder;