import Resolver from './resolver.js';
import Word_Builder from './word_builder.js';
//import Transformer from './transformer.js';
//import Text_Builder from './text_builder.js';
import Logger from '../logger.js';

const genWords = (() => {
    const vocabug = (
        logger: Logger,
        file: string,

        num_of_words: string,

        mode: string = 'word-list',
        sort_words: boolean = true,
        capitalise_words: boolean = false,
        remove_duplicates: boolean = true,
        force_word_limit: boolean = false,

        word_divider: string = " "
    ) => {

        let text = '';
        try {
            let my_resolver = new Resolver(logger, num_of_words, mode, sort_words,
                capitalise_words, remove_duplicates, force_word_limit, word_divider);

            my_resolver.parse_file(file);

            my_resolver.expand_categories();
            my_resolver.expand_segments();
            my_resolver.expand_wordshape_segments();
            my_resolver.set_wordshapes();

            my_resolver.create_record();

            let my_word_builder = new Word_Builder(logger, my_resolver.categories, my_resolver.wordshapes);

            

            //let my_transformer = new Transformer(logger,
            //    my_resolver.transforms, my_resolver.graphemes);

            //let text_builder = new Text_Builder(logger, my_resolver.alphabet,
            //    my_resolver.debug, my_resolver.paragrapha);

            // Yo! This is where we genereate da words !!!!
            // Wow. Such words.
            //while (!text_builder.terminated) {
            let word = my_word_builder.make_word();
            //    word = my_transformer.do_transforms(word);
            //    text_builder.add_word(word);
            //}
            //text = text_builder.make_text();
            text = word;
        }
        catch (e) { logger.error(e); }
        return text;
    };

    return vocabug;
})();

export default genWords;