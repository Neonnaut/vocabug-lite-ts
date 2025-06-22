// import { Fragment } from './rule.js';
import Word from './word.js';
// import { SoundSystem, createText, invalidItemAndWeight } from './wordgen.js';\
import Logger from './logger';

class Transformer {
    public logger: Logger;
   
    public graphemes: string[];
    public transforms: [ string[], string[] ]

    constructor(
        logger: Logger,
        graphemes: string[],
        transforms: [ string[], string[] ]
    ) {
        this.logger = logger;
        this.graphemes = graphemes;
        this.transforms = transforms;
    }

    do_transforms(word:Word):Word {
        return word;
    }

}

export default Transformer;