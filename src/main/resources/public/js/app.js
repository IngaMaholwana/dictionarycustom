function processWordData(data) {
    return {
        word: data[0].word,
        phonetic: data[0].phonetic,
        audio: data[0].phonetics.find(p => p.audio)?.audio,
        meanings: data[0].meanings.map(meaning => ({
            partOfSpeech: meaning.partOfSpeech,
            definitions: meaning.definitions.map(def => ({
                definition: def.definition,
                example: def.example
            }))
        })),
        synonyms: [...new Set(data[0].meanings.flatMap(m => m.synonyms))],
        antonyms: [...new Set(data[0].meanings.flatMap(m => m.antonyms))]
    };
}

function lookupWord() {
    const form = document.getElementById("form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const word = data.get("word");

        const options = { method: 'GET' };

        document.getElementById('results').innerHTML = `<p>Searching for <em>${word}</em>...</p>`;

        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, options)
            .then(response => response.json())
            .then(data => {
                const processedData = processWordData(data);
                const template = document.getElementById('results-template').innerHTML;
                const compiledFunction = Handlebars.compile(template);
                document.getElementById('results').innerHTML = compiledFunction(processedData);
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('results').innerHTML = `<p>An error occurred while searching for <em>${word}</em>. Please try again.</p>`;
            });
    });
}

function lookupSynonyms() {
    const form = document.getElementById("form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const word = data.get("word");

        const options = { method: 'GET' };

        document.getElementById('results').innerHTML = `<p>Searching for synonyms of <em>${word}</em>...</p>`;

        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, options)
            .then(response => response.json())
            .then(data => {
                const synonyms = data[0].meanings.flatMap(m => m.synonyms);
                const processedData = { word, synonyms: [...new Set(synonyms)] };
                const template = document.getElementById('results-template').innerHTML;
                const compiledFunction = Handlebars.compile(template);
                document.getElementById('results').innerHTML = compiledFunction(processedData);
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('results').innerHTML = `<p>An error occurred while searching for synonyms of <em>${word}</em>. Please try again.</p>`;
            });
    });
}

function lookupAntonyms() {
    const form = document.getElementById("form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(event.target);
        const word = data.get("word");

        const options = { method: 'GET' };

        document.getElementById('results').innerHTML = `<p>Searching for antonyms of <em>${word}</em>...</p>`;

        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, options)
            .then(response => response.json())
            .then(data => {
                const antonyms = data[0].meanings.flatMap(m => m.antonyms);
                const processedData = { word, antonyms: [...new Set(antonyms)] };
                const template = document.getElementById('results-template').innerHTML;
                const compiledFunction = Handlebars.compile(template);
                document.getElementById('results').innerHTML = compiledFunction(processedData);
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('results').innerHTML = `<p>An error occurred while searching for antonyms of <em>${word}</em>. Please try again.</p>`;
            });
    });
}

window.addEventListener('load', () => {
    const app = $('#app');

    const defaultTemplate = Handlebars.compile($('#default-template').html());
    const dictionaryTemplate = Handlebars.compile($('#dictionary-template').html());
    const synonymsTemplate = Handlebars.compile($('#synonyms-template').html());
    const antonymsTemplate = Handlebars.compile($('#antonyms-template').html());

    const router = new Router({
        mode: 'hash',
        root: 'index.html',
        page404: (path) => {
            const html = defaultTemplate();
            app.html(html);
        }
    });

    router.add('/dictionary', async () => {
        html = dictionaryTemplate();
        app.html(html);
        lookupWord();
    });

    router.add('/synonyms', async () => {
        html = synonymsTemplate();
        app.html(html);
        lookupSynonyms();
    });

    router.add('/antonyms', async () => {
        html = antonymsTemplate();
        app.html(html);
        lookupAntonyms();
    });

    router.addUriListener();

    $('a').on('click', (event) => {
        event.preventDefault();
        const target = $(event.target);
        const href = target.attr('href');
        const path = href.substring(href.lastIndexOf('/'));
        router.navigateTo(path);
    });

    router.navigateTo('/');
});
