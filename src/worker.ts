import gen_words from './modules/core';
import Logger from './logger';

onmessage = function (event) {
    let my_logger = new Logger();

    const my_words = gen_words(
        my_logger,
        event.data.file,
        event.data.num_of_words,
        event.data.mode,
        event.data.sort_words,
        event.data.capitalise_words,
        event.data.remove_duplicates,
        event.data.force_words,
        event.data.word_divider
    );

    postMessage({
        words: my_words,
        file: event.data.file,
        
        error_message: my_logger.errors.join("<br>"),
        warning_message: my_logger.warnings.join("<br>"),
        info_message: my_logger.infos.join("<br>")
    });
}

