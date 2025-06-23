// import { Fragment } from './rule.js';
import Word from './word.js';
// import { SoundSystem, createText, invalidItemAndWeight } from './wordgen.js';\
import Logger from './logger';

class Transformer {
    public logger: Logger;
   
    public graphemes: string[];
    public transforms: { target:string[], result:string[] }[];

    constructor(
        logger: Logger,
        graphemes: string[],
        transforms: { target:string[], result:string[] }[]
    ) {
        this.logger = logger;
        this.graphemes = graphemes;
        this.transforms = transforms;
    }

    // Updated spelling here
    tokenise(input: string, graphemes: string[]): string[] {
        const tokens: string[] = [];
        let i = 0;
        while (i < input.length) {
            let matched = false;
            for (const g of graphemes.sort((a, b) => b.length - a.length)) {
                if (input.startsWith(g, i)) {
                    tokens.push(g);
                    i += g.length;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                tokens.push(input[i]);
                i++;
            }
        }

        return tokens;
    }

    applyTransform(
    tokens: string[],
    transform: Transform
    ): string[] {
    let resultTokens = [...tokens];
    const { target, result } = transform;

    if (target.length !== result.length) {
        throw new Error("Mismatched target/result lengths in transform");
    }

    for (let i = 0; i < target.length; i++) {
        const search = target[i];
        const replacement = result[i];

        if (search.startsWith("#")) {
            const targetStr = search.slice(1);
        if (resultTokens.slice(0, targetStr.length).join("") === targetStr) {
            resultTokens.splice(0, targetStr.length, replacement);
        }
        } else if (search.endsWith("#")) {
            const targetStr = search.slice(0, -1);
        if (
            resultTokens.slice(-targetStr.length).join("") === targetStr
        ) {
            resultTokens.splice(
            resultTokens.length - targetStr.length,
            targetStr.length,
            replacement
            );
        }
        } else {
        for (let j = 0; j <= resultTokens.length - 1; j++) {
            const window = resultTokens.slice(j, j + search.length).join("");
            if (window === search) {
            resultTokens.splice(j, search.length, replacement);
            j += search.length - 1;
            }
        }
        }
    }

    return resultTokens;
    }

    do_transforms(
        word: Word,
    ): Word {
    let tokens = this.tokenise(word.get_last_form(), this.graphemes); // Updated here as well

    for (const t of this.transforms) {
        tokens = this.applyTransform(tokens, t);
    }

    word.forms.push(tokens.join(""));
    return word;
    }
}

export default Transformer;