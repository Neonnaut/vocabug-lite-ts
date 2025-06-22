import Resolver from './resolver.ts';
import Word_Builder from './word_builder.ts';
import Transformer from './transformer.ts';
import Text_Builder from './text_builder.ts';
import Logger from './logger.ts';

class Vocabug {
    public text: string;
    public errors: string[];
    public warnings: string[];
    public infos: string[];

    constructor(
        text: string,
        errors: string[],
        warnings: string[],
        infos: string[]
    ) {
        this.text = text;
        this.errors = errors;
        this.warnings = warnings;
        this.infos = infos;
    }

}

function genWords(
    file: string,
    num_of_words: string,
    mode: string = 'word-list',
    sort_words: boolean = true,
    capitalise_words: boolean = false,
    remove_duplicates: boolean = true,
    force_word_limit: boolean = false,
    word_divider: string = " "
): Vocabug {
    const build_start = Date.now();
    const logger = new Logger();
    let text = '';

    try {
        const resolver = new Resolver(
            logger,
            num_of_words,
            mode,
            sort_words,
            capitalise_words,
            remove_duplicates,
            force_word_limit,
            word_divider
        );

        resolver.parse_file(file);
        resolver.expand_categories();
        resolver.expand_segments();
        resolver.expand_wordshape_segments();
        resolver.set_wordshapes();
        resolver.create_record();

        const wordBuilder = new Word_Builder(
            logger,
            resolver.categories,
            resolver.wordshapes,
            resolver.wordshape_distribution,
            resolver.optionals_weight,
            resolver.debug,
            resolver.capitalise_words
        );

        const transformer = new Transformer(
            logger,
            resolver.graphemes,
            resolver.transforms
        );

        const textBuilder = new Text_Builder(
            logger,
            build_start,
            resolver.num_of_words,
            resolver.debug,
            resolver.paragrapha,
            resolver.remove_duplicates,
            resolver.force_word_limit,
            resolver.sort_words,
            resolver.capitalise_words,
            resolver.word_divider,
            resolver.alphabet
        );

        while (!textBuilder.terminated) {
            let word = wordBuilder.make_word();
            word = transformer.do_transforms(word);
            textBuilder.add_word(word);
        }

        text = textBuilder.make_text();
    } catch (e: unknown) {
        logger.error(typeof e === "string" ? e : e instanceof Error ? e.message : String(e));
    }

    return new Vocabug(text, logger.errors, logger.warnings, logger.infos);
}

export default genWords;