// Main language generator class with REAL randomization
class ConlangGenerator {
    constructor() {
        this.language = {
            phonology: {},
            morphology: {},
            syntax: {},
            culture: {},
            vocabulary: [],
            derivedWords: [],
            customWords: [],
            grammarRules: []
        };
        this.usedWords = new Set();
        
        // Track what was set by user vs generated randomly
        this.userSet = {
            phonology: false,
            morphology: false
        };
    }

    parseInput(id) {
        const element = document.getElementById(id);
        if (!element) return [];
        
        return element.value
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
    }

    getSyllableStructures() {
        const structures = [];
        const syllTypes = ['v', 'cv', 'cvc', 'ccv', 'cvcc', 'ccvc'];
        
        syllTypes.forEach(type => {
            const checkbox = document.getElementById(`syl-${type}`);
            if (checkbox && checkbox.checked) {
                structures.push(type.toUpperCase());
            }
        });
        
        return structures.length > 0 ? structures : ['CV'];
    }

    getCheckedValues(prefix) {
        const values = [];
        document.querySelectorAll(`[id^="${prefix}"]:checked`).forEach(checkbox => {
            values.push(checkbox.id.replace(prefix, ''));
        });
        return values;
    }

    // NEW: Generate random phonological system
    generateRandomPhonology() {
        // Predefined sound inventories to choose from
        const vowelSets = [
            ['a', 'e', 'i', 'o', 'u'], // Basic 5-vowel system
            ['a', 'e', 'i', 'o', 'u', 'ə'], // + schwa
            ['a', 'e', 'i', 'o', 'u', 'y'], // + front rounded
            ['a', 'ɛ', 'e', 'i', 'ɔ', 'o', 'u'], // 7-vowel system
            ['a', 'e', 'i', 'o', 'u', 'ə', 'ɪ', 'ʊ'], // English-like
            ['a', 'i', 'u'], // Minimal 3-vowel
            ['a', 'e', 'i', 'o', 'u', 'æ', 'ɑ'], // Extended
            ['a', 'ɛ', 'i', 'ɔ', 'u', 'ə'] // 6-vowel
        ];

        const consonantSets = [
            ['p', 't', 'k', 'b', 'd', 'g', 'm', 'n', 's', 'l', 'r'], // Minimal
            ['p', 't', 'k', 'b', 'd', 'g', 'm', 'n', 'ŋ', 's', 'ʃ', 'l', 'r', 'f', 'v'], // Medium
            ['p', 't', 'k', 'q', 'b', 'd', 'g', 'm', 'n', 'ŋ', 's', 'ʃ', 'x', 'l', 'r', 'w', 'j'], // Large
            ['p', 't', 'k', 'b', 'd', 'g', 'm', 'n', 's', 'z', 'ʃ', 'ʒ', 'l', 'r', 'f', 'v', 'θ', 'ð'], // English-like
            ['p', 't', 'k', 'b', 'd', 'g', 'm', 'n', 's', 'l', 'r', 'tʃ', 'dʒ'], // With affricates
            ['p', 't', 'k', 'b', 'd', 'g', 'm', 'n', 's', 'ʃ', 'l', 'r', 'j', 'w'], // With glides
            ['p', 't', 'k', 'b', 'd', 'g', 'm', 'n', 'ŋ', 's', 'z', 'l', 'r'], // Simple voiced pairs
            ['p', 't', 'k', 'b', 'd', 'g', 'm', 'n', 's', 'x', 'l', 'r', 'h'] // With fricatives
        ];

        // Randomly select vowel and consonant systems
        const randomVowelIndex = Math.floor(Math.random() * vowelSets.length);
        const randomConsonantIndex = Math.floor(Math.random() * consonantSets.length);
        
        this.language.phonology.vowels = vowelSets[randomVowelIndex];
        this.language.phonology.consonants = consonantSets[randomConsonantIndex];

        // Randomly generate syllable structures
        const allStructures = ['V', 'CV', 'CVC', 'CCV', 'CVCC', 'CCVC'];
        const numStructures = Math.floor(Math.random() * 4) + 2; // 2-5 structures
        this.language.phonology.syllableStructures = this.randomChoices(allStructures, numStructures);

        // Random environment
        const environments = ['mountain', 'coastal', 'forest', 'desert', 'plains', 'arctic', 'island', 'urban'];
        const randomEnvIndex = Math.floor(Math.random() * environments.length);
        this.language.culture.environment = environments[randomEnvIndex];

        console.log('Generated random phonology:', this.language.phonology);
        console.log('Selected vowel set:', randomVowelIndex, 'consonant set:', randomConsonantIndex, 'environment:', this.language.culture.environment);
        return this.language.phonology;
    }

    // NEW: Generate random morphological system
    generateRandomMorphology() {
        // Random word order (weighted toward common ones)
        const wordOrders = ['svo', 'svo', 'sov', 'sov', 'vso', 'vos', 'osv', 'ovs']; // SVO and SOV more common
        const randomOrderIndex = Math.floor(Math.random() * wordOrders.length);
        this.language.syntax.wordOrder = wordOrders[randomOrderIndex];

        // Randomly determine which morphological features exist
        this.language.morphology.hasCases = Math.random() > 0.4; // 60% chance
        this.language.morphology.hasPlurals = Math.random() > 0.2; // 80% chance
        this.language.morphology.hasTenses = Math.random() > 0.1; // 90% chance
        this.language.morphology.hasGenders = Math.random() > 0.6; // 40% chance

        // Generate random case systems
        if (this.language.morphology.hasCases) {
            const allCases = ['nominative', 'accusative', 'genitive', 'dative', 'locative', 'instrumental', 'ablative'];
            const numCases = Math.floor(Math.random() * 4) + 2; // 2-5 cases
            this.language.morphology.cases = this.randomChoices(allCases, numCases);
            // Always include nominative
            if (!this.language.morphology.cases.includes('nominative')) {
                this.language.morphology.cases[0] = 'nominative';
            }
        }

        // Generate random tense systems  
        if (this.language.morphology.hasTenses) {
            const allTenses = ['past', 'present', 'future', 'perfect', 'imperfect', 'pluperfect'];
            const numTenses = Math.floor(Math.random() * 4) + 2; // 2-5 tenses
            this.language.morphology.tenses = this.randomChoices(allTenses, numTenses);
            // Always include present
            if (!this.language.morphology.tenses.includes('present')) {
                this.language.morphology.tenses[0] = 'present';
            }
        }

        // Generate random gender systems
        if (this.language.morphology.hasGenders) {
            const genderSets = [
                ['masculine', 'feminine'],
                ['masculine', 'feminine', 'neuter'],
                ['animate', 'inanimate'],
                ['masculine', 'feminine', 'animate', 'inanimate']
            ];
            const randomGenderIndex = Math.floor(Math.random() * genderSets.length);
            this.language.morphology.genders = genderSets[randomGenderIndex];
        }

        // Generate random plural systems
        if (this.language.morphology.hasPlurals) {
            const pluralTypes = ['suffix', 'prefix', 'internal', 'dual'];
            const numTypes = Math.floor(Math.random() * 2) + 1; // 1-2 types
            this.language.morphology.pluralTypes = this.randomChoices(pluralTypes, numTypes);
        }

        console.log('Generated random morphology:', this.language.morphology);
        console.log('Word order:', this.language.syntax.wordOrder, 'Cases:', this.language.morphology.hasCases, 'Tenses:', this.language.morphology.hasTenses, 'Genders:', this.language.morphology.hasGenders);
        return this.language.morphology;
    }

    generatePhonology() {
        this.language.phonology.vowels = this.parseInput('vowels');
        this.language.phonology.consonants = this.parseInput('consonants');
        this.language.phonology.syllableStructures = this.getSyllableStructures();
        
        const environmentSelect = document.getElementById('environment');
        if (environmentSelect) {
            this.language.culture.environment = environmentSelect.value;
        }

        // Generate syllable combinations
        this.language.phonology.syllables = [];
        
        for (let structure of this.language.phonology.syllableStructures) {
            for (let i = 0; i < 30; i++) {
                let syllable = '';
                for (let char of structure) {
                    if (char === 'C') {
                        syllable += this.randomChoice(this.language.phonology.consonants);
                    } else if (char === 'V') {
                        syllable += this.randomChoice(this.language.phonology.vowels);
                    }
                }
                if (!this.language.phonology.syllables.includes(syllable)) {
                    this.language.phonology.syllables.push(syllable);
                }
            }
        }
        
        // Mark as user-set
        this.userSet.phonology = true;
        
        console.log('Phonology generated by user:', this.language.phonology);
        return this.language.phonology;
    }

    generateMorphologySystem() {
        const wordOrderSelect = document.getElementById('word-order');
        if (wordOrderSelect) {
            this.language.syntax.wordOrder = wordOrderSelect.value;
        }

        // Check morphological features
        this.language.morphology.hasCases = this.isChecked('has-cases');
        this.language.morphology.hasPlurals = this.isChecked('has-plurals');
        this.language.morphology.hasTenses = this.isChecked('has-tenses');
        this.language.morphology.hasGenders = this.isChecked('has-genders');
        
        if (this.language.morphology.hasCases) {
            this.language.morphology.cases = this.getCheckedValues('case-');
        }
        if (this.language.morphology.hasTenses) {
            this.language.morphology.tenses = this.getCheckedValues('tense-');
        }
        if (this.language.morphology.hasGenders) {
            this.language.morphology.genders = this.getCheckedValues('gender-');
        }
        if (this.language.morphology.hasPlurals) {
            this.language.morphology.pluralTypes = this.getCheckedValues('plural-');
        }

        // FIXED: Only generate basic grammatical affixes, no derivational ones
        this.language.morphology.affixes = {};
        
        if (this.language.morphology.hasPlurals && this.language.morphology.pluralTypes) {
            this.language.morphology.pluralTypes.forEach(type => {
                const affix = this.generateAffix(type);
                affix.originalCategory = 'number'; // Mark original category
                this.language.morphology.affixes[`plural-${type}`] = affix;
            });
        }
        
        if (this.language.morphology.hasCases && this.language.morphology.cases) {
            this.language.morphology.cases.forEach(case_ => {
                const affix = this.generateAffix();
                affix.originalCategory = 'case'; // Mark original category
                this.language.morphology.affixes[case_] = affix;
            });
        }
        
        if (this.language.morphology.hasTenses && this.language.morphology.tenses) {
            this.language.morphology.tenses.forEach(tense => {
                const affix = this.generateAffix();
                affix.originalCategory = 'tense'; // Mark original category
                this.language.morphology.affixes[tense] = affix;
            });
        }
        
        if (this.language.morphology.hasGenders && this.language.morphology.genders) {
            this.language.morphology.genders.forEach(gender => {
                const affix = this.generateAffix();
                affix.originalCategory = 'gender'; // Mark original category
                this.language.morphology.affixes[gender] = affix;
            });
        }
        
        // REMOVED: No automatic derivational affixes
        // Users can add these manually if needed
        
        // Mark as user-set
        this.userSet.morphology = true;
        
        console.log('Morphology generated by user:', this.language.morphology);
        return this.language.morphology;
    }

    isChecked(id) {
        const element = document.getElementById(id);
        return element ? element.checked : false;
    }

    generateAffix(type = null) {
        // Randomly choose affix type if not specified
        if (!type) {
            const types = ['suffix', 'prefix', 'infix'];
            const weights = [0.6, 0.3, 0.1]; // Suffixes most common
            type = this.weightedRandomChoice(types, weights);
        } else {
            // Convert plural type to affix type
            if (type === 'internal') type = 'infix';
            if (!['suffix', 'prefix', 'infix'].includes(type)) type = 'suffix';
        }

        if (!this.language.phonology.syllables || this.language.phonology.syllables.length === 0) {
            // Fallback syllable generation
            const vowels = this.language.phonology.vowels || ['a', 'e', 'i', 'o', 'u'];
            const consonants = this.language.phonology.consonants || ['p', 't', 'k', 'm', 'n'];
            const morpheme = this.randomChoice(consonants) + this.randomChoice(vowels);
            
            return {
                type: type,
                morpheme: morpheme
            };
        }

        const morpheme = this.randomChoice(this.language.phonology.syllables);
        
        return {
            type: type,
            morpheme: morpheme
        };
    }

    generateVocabulary() {
        const coreWords = [
            // Pronouns
            { english: 'I', pos: 'pronoun' },
            { english: 'you', pos: 'pronoun' },
            { english: 'he/she', pos: 'pronoun' },
            { english: 'we', pos: 'pronoun' },
            { english: 'you (pl.)', pos: 'pronoun' },
            { english: 'they', pos: 'pronoun' },
            { english: 'this', pos: 'pronoun' },
            { english: 'that', pos: 'pronoun' },
            { english: 'what', pos: 'pronoun' },
            { english: 'who', pos: 'pronoun' },
            { english: 'which', pos: 'pronoun' },

            // Adverbs
            { english: 'here', pos: 'adverb' },
            { english: 'there', pos: 'adverb' },
            { english: 'when', pos: 'adverb' },
            { english: 'where', pos: 'adverb' },
            { english: 'why', pos: 'adverb' },
            { english: 'how', pos: 'adverb' },
            { english: 'yes', pos: 'adverb' },
            { english: 'no', pos: 'adverb' },
            
            // Essential verbs
            { english: 'be', pos: 'verb' },
            { english: 'go', pos: 'verb' },
            { english: 'see', pos: 'verb' },
            { english: 'speak', pos: 'verb' },
            { english: 'eat', pos: 'verb' },
            { english: 'drink', pos: 'verb' },
            { english: 'love', pos: 'verb' },
            { english: 'give', pos: 'verb' },
            { english: 'take', pos: 'verb' },
            { english: 'sleep', pos: 'verb' },
            { english: 'like', pos: 'verb' },
            { english: 'want', pos: 'verb' },
            { english: 'need', pos: 'verb' },
            { english: 'have', pos: 'verb' },
            { english: 'hear', pos: 'verb' },
            { english: 'buy', pos: 'verb' },
            { english: 'sell', pos: 'verb' },
            { english: 'touch', pos: 'verb' },
            { english: 'feel', pos: 'verb' },
            { english: 'know', pos: 'verb' },
            { english: 'learn', pos: 'verb' },
            { english: 'teach', pos: 'verb' },
            { english: 'study', pos: 'verb' },
            { english: 'live', pos: 'verb' },
            { english: 'understand', pos: 'verb' },
            { english: 'cook', pos: 'verb' },
            { english: 'wash', pos: 'verb' },
            { english: 'travel', pos: 'verb' },
            { english: 'die', pos: 'verb' },
            { english: 'kill', pos: 'verb' },
            { english: 'sit', pos: 'verb' },
            { english: 'stand', pos: 'verb' },
            { english: 'lie', pos: 'verb' },
            { english: 'come', pos: 'verb' },
            { english: 'laugh', pos: 'verb' },
            { english: 'think', pos: 'verb' },
            { english: 'smell', pos: 'verb' },
            { english: 'fight', pos: 'verb' },
            { english: 'hunt', pos: 'verb' },
            { english: 'cut', pos: 'verb' },
            { english: 'hit', pos: 'verb' },
            { english: 'fall', pos: 'verb' },
            { english: 'hold', pos: 'verb' },
            { english: 'pull', pos: 'verb' },
            { english: 'push', pos: 'verb' },
            { english: 'tie', pos: 'verb' },
            { english: 'sew', pos: 'verb' },
            { english: 'turn', pos: 'verb' },
            { english: 'count', pos: 'verb' },
            { english: 'say', pos: 'verb' },
            { english: 'play', pos: 'verb' },
            { english: 'spit', pos: 'verb' },
            { english: 'vomit', pos: 'verb' },
            { english: 'bite', pos: 'verb' },
            { english: 'suck', pos: 'verb' },
            { english: 'blow', pos: 'verb' },
            { english: 'breathe', pos: 'verb' },
            { english: 'stab', pos: 'verb' },
            { english: 'scratch', pos: 'verb' },
            { english: 'split', pos: 'verb' },
            { english: 'dig', pos: 'verb' },
            { english: 'pee', pos: 'verb' },
            { english: 'poo', pos: 'verb' },
            { english: 'hate', pos: 'verb' },
            { english: 'taste', pos: 'verb' },
            
            // Essential nouns
            { english: 'water', pos: 'noun' },
            { english: 'fire', pos: 'noun' },
            { english: 'sun', pos: 'noun' },
            { english: 'moon', pos: 'noun' },
            { english: 'star', pos: 'noun' },
            { english: 'tree', pos: 'noun' },
            { english: 'house', pos: 'noun' },
            { english: 'stone', pos: 'noun' },
            { english: 'sand', pos: 'noun' },
            { english: 'dust', pos: 'noun' },
            { english: 'fog', pos: 'noun' },
            { english: 'ice', pos: 'noun' },
            { english: 'person', pos: 'noun' },
            { english: 'man', pos: 'noun' },
            { english: 'woman', pos: 'noun' },
            { english: 'friend', pos: 'noun' },
            { english: 'hand', pos: 'noun' },
            { english: 'finger', pos: 'noun' },
            { english: 'fingernail', pos: 'noun' },
            { english: 'face', pos: 'noun' },
            { english: 'head', pos: 'noun' },
            { english: 'nose', pos: 'noun' },
            { english: 'eye', pos: 'noun' },
            { english: 'tooth', pos: 'noun' },
            { english: 'tongue', pos: 'noun' },
            { english: 'mouth', pos: 'noun' },
            { english: 'hair', pos: 'noun' },
            { english: 'bone', pos: 'noun' },
            { english: 'blood', pos: 'noun' },
            { english: 'leg', pos: 'noun' },
            { english: 'arm', pos: 'noun' },
            { english: 'foot', pos: 'noun' },
            { english: 'body', pos: 'noun' },
            { english: 'belly', pos: 'noun' },
            { english: 'chest', pos: 'noun' },
            { english: 'neck', pos: 'noun' },
            { english: 'knee', pos: 'noun' },
            { english: 'back', pos: 'noun' },
            { english: 'heart', pos: 'noun' },
            { english: 'food', pos: 'noun' },
            { english: 'drink', pos: 'noun' },
            { english: 'bread', pos: 'noun' },
            { english: 'rice', pos: 'noun' },
            { english: 'meat', pos: 'noun' },
            { english: 'fish', pos: 'noun' },
            { english: 'vegetable', pos: 'noun' },
            { english: 'time', pos: 'noun' },
            { english: 'day', pos: 'noun' },
            { english: 'night', pos: 'noun' },
            { english: 'sky', pos: 'noun' },

            
            // Essential adjectives
            { english: 'good', pos: 'adjective' },
            { english: 'bad', pos: 'adjective' },
            { english: 'big', pos: 'adjective' },
            { english: 'small', pos: 'adjective' },
            { english: 'hot', pos: 'adjective' },
            { english: 'new', pos: 'adjective' },
            { english: 'old', pos: 'adjective' },
            { english: 'wet', pos: 'adjective' },
            { english: 'dry', pos: 'adjective' },
            { english: 'long', pos: 'adjective' },
            { english: 'short', pos: 'adjective' },
            { english: 'tall', pos: 'adjective' },
            { english: 'narrow', pos: 'adjective' },
            { english: 'wide', pos: 'adjective' },
            { english: 'thin', pos: 'adjective' },
            { english: 'thick', pos: 'adjective' },
            { english: 'clean', pos: 'adjective' },
            { english: 'dirty', pos: 'adjective' },
            { english: 'correct', pos: 'adjective' },
            { english: 'wrong', pos: 'adjective' },
            { english: 'near', pos: 'adjective' },
            { english: 'far', pos: 'adjective' },
            { english: 'full', pos: 'adjective' },
            { english: 'empty', pos: 'adjective' },
            { english: 'cold', pos: 'adjective' },
            { english: 'other', pos: 'adjective' },
            { english: 'same', pos: 'adjective' },
            { english: 'different', pos: 'adjective' },
            
            // Numbers
            { english: 'one', pos: 'number' },
            { english: 'two', pos: 'number' },
            { english: 'three', pos: 'number' },
            { english: 'four', pos: 'number' },
            { english: 'five', pos: 'number' },
            { english: 'many', pos: 'number' },
            { english: 'some', pos: 'number' },
            { english: 'all', pos: 'number' },
            { english: 'how many', pos: 'number' },
        ];

        // Add cultural words based on environment
        const culturalWords = this.getCulturalWords();
        const allBaseWords = [...coreWords, ...culturalWords];

        this.language.vocabulary = allBaseWords.map(word => ({
            conlang: this.generateWord(),
            english: word.english,
            pos: word.pos,
            type: 'core'
        }));

        console.log('Vocabulary generated:', this.language.vocabulary.length + ' words');
        return this.language.vocabulary;
    }

    getCulturalWords() {
        const environmentWords = {
            mountain: [
                { english: 'peak', pos: 'noun' },
                { english: 'valley', pos: 'noun' },
                { english: 'climb', pos: 'verb' },
                { english: 'steep', pos: 'adjective' }
            ],
            coastal: [
                { english: 'wave', pos: 'noun' },
                { english: 'shore', pos: 'noun' },
                { english: 'sail', pos: 'verb' },
                { english: 'beach', pos: 'noun' },
                { english: 'boat', pos: 'noun' },
                { english: 'salt', pos: 'noun' }
            ],
            forest: [
                { english: 'branch', pos: 'noun' },
                { english: 'leaf', pos: 'noun' },
                { english: 'hunt', pos: 'verb' },
                { english: 'green', pos: 'adjective' }
            ],
            desert: [
                { english: 'sand', pos: 'noun' },
                { english: 'oasis', pos: 'noun' },
                { english: 'wander', pos: 'verb' },
                { english: 'dry', pos: 'adjective' }
            ],
            plains: [
                { english: 'grass', pos: 'noun' },
                { english: 'horizon', pos: 'noun' },
                { english: 'run', pos: 'verb' },
                { english: 'wide', pos: 'adjective' }
            ],
            arctic: [
                { english: 'ice', pos: 'noun' },
                { english: 'snow', pos: 'noun' },
                { english: 'freeze', pos: 'verb' },
                { english: 'white', pos: 'adjective' }
            ],
            island: [
                { english: 'island', pos: 'noun' },
                { english: 'coral', pos: 'noun' },
                { english: 'swim', pos: 'verb' },
                { english: 'tropical', pos: 'adjective' }
            ],
            urban: [
                { english: 'street', pos: 'noun' },
                { english: 'building', pos: 'noun' },
                { english: 'travel', pos: 'verb' },
                { english: 'busy', pos: 'adjective' }
            ]
        };

        return environmentWords[this.language.culture.environment] || [];
    }

    generateWord(syllableCount = null) {
        if (!this.language.phonology.syllables || this.language.phonology.syllables.length === 0) {
            // Fallback word generation - ensure we have syllable structures
            const vowels = this.language.phonology.vowels || ['a', 'e', 'i', 'o', 'u'];
            const consonants = this.language.phonology.consonants || ['p', 't', 'k', 'm', 'n', 's', 'l', 'r'];
            const structures = this.language.phonology.syllableStructures || ['CV', 'CVC'];
            
            const count = syllableCount || Math.floor(Math.random() * 2) + 1;
            
            // Generate word using proper syllable structures
            return this.generateWordWithStructures(count, structures, consonants, vowels);
        }

        // Use existing syllables but ensure proper syllable count
        const requestedCount = syllableCount || Math.floor(Math.random() * 2) + 1;
        
        // Try to generate a unique word up to 50 times
        for (let attempt = 0; attempt < 50; attempt++) {
            let word = '';
            
            // Generate exactly the requested number of syllables
            for (let i = 0; i < requestedCount; i++) {
                word += this.randomChoice(this.language.phonology.syllables);
            }
            
            // Check if this word is unique
            if (!this.usedWords.has(word)) {
                this.usedWords.add(word);
                return word;
            }
        }
        
        // If we couldn't generate a unique word from existing syllables,
        // fall back to generating new syllables with proper structures
        const vowels = this.language.phonology.vowels || ['a', 'e', 'i', 'o', 'u'];
        const consonants = this.language.phonology.consonants || ['p', 't', 'k', 'm', 'n', 's', 'l', 'r'];
        const structures = this.language.phonology.syllableStructures || ['CV', 'CVC'];
        
        return this.generateWordWithStructures(requestedCount, structures, consonants, vowels);
    }

    // NEW HELPER FUNCTION: Generate words using proper syllable structures
    generateWordWithStructures(syllableCount, structures, consonants, vowels) {
        // Try to generate a unique word up to 100 times
        for (let attempt = 0; attempt < 100; attempt++) {
            let word = '';
            
            // Generate each syllable using proper structures
            for (let i = 0; i < syllableCount; i++) {
                const structure = this.randomChoice(structures);
                let syllable = '';
                
                for (let char of structure) {
                    if (char === 'C') {
                        syllable += this.randomChoice(consonants);
                    } else if (char === 'V') {
                        syllable += this.randomChoice(vowels);
                    }
                    // Ignore any other characters in structure
                }
                
                word += syllable;
            }
            
            // Check if this word is unique
            if (!this.usedWords.has(word)) {
                this.usedWords.add(word);
                return word;
            }
        }
        
        // Last resort: add a number suffix to ensure uniqueness
        let baseWord = '';
        for (let i = 0; i < syllableCount; i++) {
            const structure = this.randomChoice(structures);
            let syllable = '';
            
            for (let char of structure) {
                if (char === 'C') {
                    syllable += this.randomChoice(consonants);
                } else if (char === 'V') {
                    syllable += this.randomChoice(vowels);
                }
            }
            
            baseWord += syllable;
        }
        
        // Add number suffix if needed
        let word = baseWord;
        let suffix = 1;
        while (this.usedWords.has(word)) {
            word = baseWord + suffix;
            suffix++;
            if (suffix > 99) break; // Prevent infinite loop
        }
        
        this.usedWords.add(word);
        return word;
    }

    randomChoice(array) {
        if (!array || array.length === 0) return '';
        return array[Math.floor(Math.random() * array.length)];
    }

    // NEW: Helper for selecting multiple random items
    randomChoices(array, count) {
        if (!array || array.length === 0) return [];
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    }

    // NEW: Weighted random choice
    weightedRandomChoice(choices, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < choices.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return choices[i];
            }
        }
        
        return choices[choices.length - 1];
    }

    // RESTORED: Original behavior - uses existing USER choices or generates random ones
    generateCompleteLanguage() {
        console.log('Generating complete language...');
        console.log('User set phonology:', this.userSet.phonology, 'morphology:', this.userSet.morphology);
        
        // Check if phonology was set by USER (not randomly generated)
        if (!this.userSet.phonology || !this.language.phonology.vowels || this.language.phonology.vowels.length === 0) {
            console.log('No user phonology found, generating random phonology...');
            this.generateRandomPhonology();
            this.userSet.phonology = false; // Mark as randomly generated, not user-set
        } else {
            console.log('Using existing user phonology...');
        }
        
        // Generate syllables if they don't exist
        if (!this.language.phonology.syllables || this.language.phonology.syllables.length === 0) {
            this.language.phonology.syllables = [];
            for (let structure of this.language.phonology.syllableStructures) {
                for (let i = 0; i < 20; i++) {
                    let syllable = '';
                    for (let char of structure) {
                        if (char === 'C') {
                            syllable += this.randomChoice(this.language.phonology.consonants);
                        } else if (char === 'V') {
                            syllable += this.randomChoice(this.language.phonology.vowels);
                        }
                    }
                    if (!this.language.phonology.syllables.includes(syllable)) {
                        this.language.phonology.syllables.push(syllable);
                    }
                }
            }
        }
        
        // Check if morphology was set by USER (not randomly generated)
        if (!this.userSet.morphology || !this.language.morphology.affixes || Object.keys(this.language.morphology.affixes).length === 0) {
            console.log('No user grammar found, generating random morphology...');
            this.generateRandomMorphology();
            this.userSet.morphology = false; // Mark as randomly generated, not user-set
            
            // Generate affixes based on morphology
            this.language.morphology.affixes = {};
            
            // Case affixes
            if (this.language.morphology.cases) {
                this.language.morphology.cases.forEach(case_ => {
                    const affix = this.generateAffix();
                    affix.originalCategory = 'case';
                    this.language.morphology.affixes[case_] = affix;
                });
            }
            
            // Tense affixes
            if (this.language.morphology.tenses) {
                this.language.morphology.tenses.forEach(tense => {
                    const affix = this.generateAffix();
                    affix.originalCategory = 'tense';
                    this.language.morphology.affixes[tense] = affix;
                });
            }
            
            // Plural affixes
            if (this.language.morphology.pluralTypes) {
                this.language.morphology.pluralTypes.forEach(type => {
                    const affix = this.generateAffix(type);
                    affix.originalCategory = 'number';
                    this.language.morphology.affixes[`plural-${type}`] = affix;
                });
            }
            
            // Gender affixes
            if (this.language.morphology.genders) {
                this.language.morphology.genders.forEach(gender => {
                    const affix = this.generateAffix();
                    affix.originalCategory = 'gender';
                    this.language.morphology.affixes[gender] = affix;
                });
            }
            
            // REMOVED: No automatic derivational affixes for random generation either
        } else {
            console.log('Using existing user grammar...');
        }
        
        // Always generate vocabulary (this allows adding to existing vocabulary)
        this.generateVocabulary();
        
        // Generate derived words if we have vocabulary and affixes
        if (this.language.vocabulary.length > 0 && this.language.morphology.affixes) {
            this.generateDerivedWords();
        }
        
        // Generate grammar rules
        this.generateGrammarRules();
        
        console.log('Complete language generated:', this.language);
        return this.language;
    }

    generateDerivedWords() {
        this.language.derivedWords = [];
        
        // FIXED: Only generate derived words if the corresponding derivational affixes exist
        const nouns = this.language.vocabulary.filter(w => w.pos === 'noun').slice(0, 8);
        const verbs = this.language.vocabulary.filter(w => w.pos === 'verb').slice(0, 8);
        const adjectives = this.language.vocabulary.filter(w => w.pos === 'adjective').slice(0, 5);
        
        // Noun to verb derivation - only if affix exists
        if (this.language.morphology.affixes && this.language.morphology.affixes['noun-to-verb']) {
            nouns.forEach(noun => {
                const affix = this.language.morphology.affixes['noun-to-verb'];
                const derived = this.applyAffix(noun.conlang, affix);
                this.language.derivedWords.push({
                    conlang: derived,
                    english: `to use ${noun.english}`,
                    pos: 'verb',
                    derivedFrom: noun.conlang,
                    derivationType: 'noun-to-verb',
                    type: 'derived'
                });
            });
        }
        
        // Verb to noun derivation - only if affix exists
        if (this.language.morphology.affixes && this.language.morphology.affixes['verb-to-noun']) {
            verbs.forEach(verb => {
                const affix = this.language.morphology.affixes['verb-to-noun'];
                const derived = this.applyAffix(verb.conlang, affix);
                this.language.derivedWords.push({
                    conlang: derived,
                    english: `${verb.english}er`,
                    pos: 'noun',
                    derivedFrom: verb.conlang,
                    derivationType: 'verb-to-noun',
                    type: 'derived'
                });
            });
        }
        
        // Adjective to adverb derivation - only if affix exists
        if (this.language.morphology.affixes && this.language.morphology.affixes['adj-to-adv']) {
            adjectives.forEach(adj => {
                const affix = this.language.morphology.affixes['adj-to-adv'];
                const derived = this.applyAffix(adj.conlang, affix);
                this.language.derivedWords.push({
                    conlang: derived,
                    english: `${adj.english}ly`,
                    pos: 'adverb',
                    derivedFrom: adj.conlang,
                    derivationType: 'adj-to-adv',
                    type: 'derived'
                });
            });
        }
        
        // Diminutives - only if affix exists
        if (this.language.morphology.affixes && this.language.morphology.affixes.diminutive) {
            nouns.slice(0, 5).forEach(noun => {
                const affix = this.language.morphology.affixes.diminutive;
                const derived = this.applyAffix(noun.conlang, affix);
                this.language.derivedWords.push({
                    conlang: derived,
                    english: `little ${noun.english}`,
                    pos: 'noun',
                    derivedFrom: noun.conlang,
                    derivationType: 'diminutive',
                    type: 'derived'
                });
            });
        }
    }

    applyAffix(root, affix) {
        switch (affix.type) {
            case 'prefix':
                return affix.morpheme + root;
            case 'suffix':
                return root + affix.morpheme;
            case 'infix':
                const mid = Math.floor(root.length / 2);
                return root.slice(0, mid) + affix.morpheme + root.slice(mid);
            default:
                return root + affix.morpheme;
        }
    }

    generateGrammarRules() {
        this.language.grammarRules = [];
        
        // Phonology rules
        this.language.grammarRules.push({
            category: 'Phonology',
            rule: `The language has ${this.language.phonology.vowels.length} vowels and ${this.language.phonology.consonants.length} consonants`,
            details: `Vowels: ${this.language.phonology.vowels.join(', ')}\nConsonants: ${this.language.phonology.consonants.join(', ')}`
        });
        
        this.language.grammarRules.push({
            category: 'Phonology',
            rule: `Allowed syllable structures: ${this.language.phonology.syllableStructures.join(', ')}`,
            details: 'C = consonant, V = vowel'
        });
        
        // Syntax rules
        this.language.grammarRules.push({
            category: 'Syntax',
            rule: `Basic word order: ${this.language.syntax.wordOrder.toUpperCase()}`,
            details: this.getWordOrderDescription()
        });
        
        // Morphology rules
        if (this.language.morphology.hasCases && this.language.morphology.cases) {
            this.language.grammarRules.push({
                category: 'Morphology',
                rule: `Case system with ${this.language.morphology.cases.length} cases: ${this.language.morphology.cases.join(', ')}`,
                details: 'Cases mark grammatical relationships'
            });
        }
        
        if (this.language.morphology.hasTenses && this.language.morphology.tenses) {
            this.language.grammarRules.push({
                category: 'Morphology',
                rule: `Tense system includes: ${this.language.morphology.tenses.join(', ')}`,
                details: 'Tenses mark temporal relationships'
            });
        }
        
        if (this.language.morphology.hasGenders && this.language.morphology.genders) {
            this.language.grammarRules.push({
                category: 'Morphology',
                rule: `Gender system: ${this.language.morphology.genders.join(', ')}`,
                details: 'All nouns belong to one of these gender categories'
            });
        }
        
        if (this.language.morphology.hasPlurals && this.language.morphology.pluralTypes) {
            this.language.grammarRules.push({
                category: 'Morphology',
                rule: `Plural formation: ${this.language.morphology.pluralTypes.join(', ')}`,
                details: 'Plurals are formed by adding affixes'
            });
        }
        
        // Derivational morphology
        this.language.grammarRules.push({
            category: 'Word Formation',
            rule: 'The language has productive derivational morphology',
            details: 'Words can be derived using affixes to change part of speech or meaning'
        });
        
        return this.language.grammarRules;
    }

    getWordOrderDescription() {
        const descriptions = {
            'svo': 'Standard subject-verb-object order like English',
            'sov': 'Subject-object-verb order like Japanese',
            'vso': 'Verb-subject-object order like Welsh',
            'vos': 'Verb-object-subject order like Malagasy',
            'osv': 'Object-subject-verb order (rare)',
            'ovs': 'Object-verb-subject order (very rare)',
            'free': 'Free word order determined by case marking'
        };
        return descriptions[this.language.syntax.wordOrder] || 'Variable word order';
    }
}

// Create global generator instance
window.generator = new ConlangGenerator();