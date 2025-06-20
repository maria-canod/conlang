// AI Assistant Module - Main coordinator for intelligent language assistance
window.AIAssistant = {
    // Core state
    initialized: false,
    localAI: null,
    cloudAI: null,
    settings: {
        provider: 'local',
        apiKey: null,
        remoteEndpoint: 'http://192.168.1.100:11434',
        remoteModel: 'llama3.1',
        openRouterModel: 'meta-llama/llama-3.1-8b-instruct:free',
        autoApply: true,
        culturalFiltering: true,
        learningMode: true
    },
    stats: {
        totalSuggestions: 0,
        acceptedSuggestions: 0,
        aiAddedWords: 0,
        accuracyRate: 0
    },

    async init() {
        console.log('Initializing AI Assistant...');
        
        // Always re-initialize to fix tab switching issues
        this.initialized = false;

        try {
            // Load settings FIRST before initializing AI
            this.loadSettings();
            this.loadStats();

            // Initialize local AI with saved settings
            if (window.LocalAI) {
                this.localAI = window.LocalAI;
                if (!this.localAI.initialized) {
                    await this.localAI.init();
                    console.log('Local AI initialized successfully');
                }
                
                // Apply saved settings to LocalAI
                this.applySavedSettingsToAI();
            }

            // Bind events every time (important for tab switching)
            this.bindEvents();

            // Update UI and populate dropdowns
            this.updateAnalysisOverview();
            this.updateUIState();
            
            // Populate morphology dropdowns after a delay to ensure DOM is ready
            setTimeout(() => {
                this.populateBaseWordDropdown();
            }, 500);
            
            this.initialized = true;
            console.log('AI Assistant initialized successfully');

        } catch (error) {
            console.error('Failed to initialize AI Assistant:', error);
            showToast('AI Assistant initialization failed', 'error');
        }
    },

    bindEvents() {
        console.log('Binding AI Assistant events...');
        
        // Update debug info and bind events with a longer delay to ensure DOM is ready
        setTimeout(() => {
            if (this.updateDebugInfo) {
                this.updateDebugInfo();
            }
            // Also refresh the analysis overview in case vocabulary was loaded after init
            this.updateAnalysisOverview();
            
            // Re-bind critical events that might have failed
            this.rebindCriticalEvents();
            
            // Force initial UI state update
            this.updateUIState();
        }, 1000); // Even longer delay to ensure DOM is fully loaded
        
        // Vocabulary expansion events
        const generateBtn = document.getElementById('generate-suggestions-btn');
        if (generateBtn) {
            generateBtn.onclick = () => this.generateVocabularySuggestions();
            console.log('Generate suggestions button bound');
        } else {
            console.warn('Generate suggestions button not found');
        }

        const analyzeBtn = document.getElementById('analyze-gaps-btn');
        if (analyzeBtn) {
            analyzeBtn.onclick = () => this.analyzeVocabularyGaps();
            console.log('Analyze gaps button bound');
        } else {
            console.warn('Analyze gaps button not found');
        }

        // Translation events
        const translateBtn = document.getElementById('translate-text-btn');
        if (translateBtn) {
            translateBtn.onclick = () => this.translateText();
        } else {
            console.warn('Translate button not found');
        }

        const identifyBtn = document.getElementById('identify-missing-btn');
        if (identifyBtn) {
            identifyBtn.onclick = () => this.identifyMissingWords();
        } else {
            console.warn('Identify missing button not found');
        }

        // Morphological events - FIXED
        const derivativesBtn = document.getElementById('generate-derivatives-btn');
        if (derivativesBtn) {
            derivativesBtn.onclick = () => this.generateDerivatives();
            console.log('Generate derivatives button bound');
        } else {
            console.warn('Generate derivatives button not found');
        }

        const compoundsBtn = document.getElementById('generate-compounds-btn');
        if (compoundsBtn) {
            compoundsBtn.onclick = () => this.generateCompounds();
            console.log('Generate compounds button bound');
        } else {
            console.warn('Generate compounds button not found');
        }

        const wordFamilyBtn = document.getElementById('expand-word-family-btn');
        if (wordFamilyBtn) {
            wordFamilyBtn.onclick = () => this.expandWordFamily();
            console.log('Expand word family button bound');
        } else {
            console.warn('Expand word family button not found');
        }

        // Cultural analysis events - FIXED
        const consistencyBtn = document.getElementById('check-consistency-btn');
        if (consistencyBtn) {
            consistencyBtn.onclick = () => this.checkCulturalConsistency();
            console.log('Check consistency button bound');
        } else {
            console.warn('Check consistency button not found');
        }

        const culturalVocabBtn = document.getElementById('suggest-cultural-vocab-btn');
        if (culturalVocabBtn) {
            culturalVocabBtn.onclick = () => this.suggestCulturalVocabulary();
            console.log('Suggest cultural vocab button bound');
        } else {
            console.warn('Suggest cultural vocab button not found');
        }

        // Bind provider events
        this.bindProviderEvents();

        console.log('AI Assistant events binding completed');
    },

    bindProviderEvents() {
        // Settings events
        const providerSelect = document.getElementById('ai-provider');
        if (providerSelect) {
            providerSelect.onchange = (e) => this.changeProvider(e.target.value);
        }

        // API key input
        const apiKeyInput = document.getElementById('api-key-input');
        if (apiKeyInput) {
            apiKeyInput.oninput = (e) => this.updateApiKey(e.target.value);
        }

        // Remote Ollama inputs
        const remoteEndpointInput = document.getElementById('remote-endpoint-input');
        if (remoteEndpointInput) {
            remoteEndpointInput.oninput = (e) => this.updateRemoteEndpoint(e.target.value);
        }

        const remoteModelInput = document.getElementById('remote-model-input');
        if (remoteModelInput) {
            remoteModelInput.oninput = (e) => this.updateRemoteModel(e.target.value);
        }

        // OpenRouter model selection
        const openRouterModelSelect = document.getElementById('openrouter-model-select');
        if (openRouterModelSelect) {
            openRouterModelSelect.onchange = (e) => this.updateOpenRouterModel(e.target.value);
        }

        // Test connection button
        const testRemoteBtn = document.getElementById('test-remote-connection-btn');
        if (testRemoteBtn) {
            testRemoteBtn.onclick = () => this.testRemoteConnection();
        }

        // Debug refresh button
        const refreshBtn = document.getElementById('refresh-ai-status-btn');
        if (refreshBtn) {
            refreshBtn.onclick = () => this.refreshAIStatus();
        }
    },

    // Enhanced provider change handler
    changeProvider(provider) {
        console.log(`Changing AI provider to: ${provider}`);
        
        this.settings.provider = provider;
        
        // Configure LocalAI based on provider
        if (this.localAI) {
            switch (provider) {
                case 'local':
                    this.localAI.provider = 'local';
                    this.localAI.apiEndpoint = 'http://localhost:11434';
                    this.localAI.apiKey = null;
                    console.log('Configured for local Ollama');
                    break;
                    
                case 'remote_ollama':
                    this.localAI.provider = 'remote_ollama';
                    this.localAI.apiEndpoint = null; // Will be set by remote endpoint
                    this.localAI.apiKey = null;
                    this.localAI.remoteEndpoint = this.settings.remoteEndpoint || 'http://192.168.1.100:11434';
                    this.localAI.remoteModel = this.settings.remoteModel || 'llama3.1';
                    console.log('Configured for remote Ollama');
                    break;
                    
                case 'openrouter':
                    this.localAI.provider = 'openrouter';
                    this.localAI.apiEndpoint = 'https://openrouter.ai/api/v1';
                    this.localAI.apiKey = this.settings.apiKey;
                    this.localAI.openRouterModel = this.settings.openRouterModel || 'meta-llama/llama-3.1-8b-instruct:free';
                    console.log('Configured for OpenRouter');
                    break;
                    
                case 'openai':
                    this.localAI.provider = 'openai';
                    this.localAI.apiEndpoint = 'https://api.openai.com/v1';
                    this.localAI.apiKey = this.settings.apiKey;
                    console.log('Configured for OpenAI');
                    break;
                    
                case 'anthropic':
                    this.localAI.provider = 'anthropic';
                    this.localAI.apiEndpoint = 'https://api.anthropic.com/v1';
                    this.localAI.apiKey = this.settings.apiKey;
                    console.log('Configured for Anthropic');
                    break;
                    
                default:
                    console.warn('Unknown provider:', provider);
                    return;
            }
        }
        
        this.saveSettings();
        this.updateUIState();
        showToast(`Switched to ${this.getProviderDisplayName(provider)}`, 'success');
    },

    // Enhanced API key handler
    updateApiKey(apiKey) {
        console.log('Updating API key...');
        
        this.settings.apiKey = apiKey;
        
        // Apply to LocalAI if using a cloud provider
        if (this.localAI && ['openrouter', 'openai', 'anthropic'].includes(this.settings.provider)) {
            this.localAI.apiKey = apiKey;
        }
        
        this.saveSettings();
        
        if (apiKey && apiKey.trim()) {
            showToast('API key saved', 'success');
        }
    },

    // Remote Ollama handlers
    updateRemoteEndpoint(endpoint) {
        console.log('Updating remote endpoint:', endpoint);
        
        this.settings.remoteEndpoint = endpoint;
        
        if (this.localAI && this.settings.provider === 'remote_ollama') {
            this.localAI.remoteEndpoint = endpoint;
        }
        
        this.saveSettings();
        showToast('Remote endpoint saved', 'success');
    },

    updateRemoteModel(model) {
        console.log('Updating remote model:', model);
        
        this.settings.remoteModel = model;
        
        if (this.localAI && this.settings.provider === 'remote_ollama') {
            this.localAI.remoteModel = model;
        }
        
        this.saveSettings();
        showToast('Remote model saved', 'success');
    },

    updateOpenRouterModel(model) {
        console.log('Updating OpenRouter model:', model);
        
        this.settings.openRouterModel = model;
        
        if (this.localAI && this.settings.provider === 'openrouter') {
            this.localAI.openRouterModel = model;
        }
        
        this.saveSettings();
        showToast('OpenRouter model saved', 'success');
    },

    // Test remote connection
    async testRemoteConnection() {
        const endpoint = this.settings.remoteEndpoint || document.getElementById('remote-endpoint-input')?.value;
        
        if (!endpoint) {
            showToast('Please enter a remote endpoint', 'error');
            return;
        }
        
        this.showLoading('test-remote-connection-btn');
        
        try {
            console.log('Testing remote connection to:', endpoint);
            
            const response = await fetch(`${endpoint}/api/tags`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Remote connection successful:', data);
                showToast(`✅ Connected! Found ${data.models?.length || 0} models`, 'success');
                
                // Update available models display if exists
                const modelsList = data.models?.map(m => m.name).join(', ') || 'None';
                showToast(`Available models: ${modelsList}`, 'info');
                
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Remote connection failed:', error);
            showToast(`❌ Connection failed: ${error.message}`, 'error');
        }
        
        this.hideLoading('test-remote-connection-btn');
    },

    // Enhanced settings application
    applySavedSettingsToAI() {
        if (!this.localAI) return;
        
        console.log('Applying saved settings to AI:', this.settings);
        
        // Use the changeProvider method to properly configure everything
        this.changeProvider(this.settings.provider || 'local');
    },

    // Helper method for display names
    getProviderDisplayName(provider) {
        const names = {
            'local': 'Local Ollama',
            'remote_ollama': 'Remote Ollama',
            'openrouter': 'OpenRouter',
            'openai': 'OpenAI',
            'anthropic': 'Anthropic Claude'
        };
        return names[provider] || provider;
    },

    // FIXED: Populate base word dropdown for morphology
    populateBaseWordDropdown() {
        const baseWordSelect = document.getElementById('base-word-select');
        if (!baseWordSelect) return;
        
        console.log('Populating base word dropdown...');
        
        // Get vocabulary from the same source as other methods
        const context = this.getLanguageContext();
        const vocabulary = context.vocabulary;
        
        if (!vocabulary || vocabulary.length === 0) {
            baseWordSelect.innerHTML = '<option value="">No vocabulary available. Add some words first!</option>';
            return;
        }
        
        // Clear existing options
        baseWordSelect.innerHTML = '<option value="">Select a word to expand...</option>';
        
        // Add vocabulary words
        vocabulary.forEach((word, index) => {
            const option = document.createElement('option');
            option.value = word.english; // Use English word as value
            option.textContent = `${word.conlang} (${word.english}) - ${word.pos}`;
            option.dataset.index = index;
            option.dataset.conlang = word.conlang;
            option.dataset.pos = word.pos;
            baseWordSelect.appendChild(option);
        });
        
        console.log(`Populated dropdown with ${vocabulary.length} words`);
    },

    // Add this method to refresh dropdowns when vocabulary changes
    refreshMorphologyDropdowns() {
        this.populateBaseWordDropdown();
        
        // Also refresh other dropdowns if they exist
        if (window.MorphologyModule && window.MorphologyModule.updateAffixDropdowns) {
            window.MorphologyModule.updateAffixDropdowns();
        }
    },

    // FIXED: Generate derivatives
    async generateDerivatives() {
        const selectedWord = document.getElementById('base-word-select')?.value;
        if (!selectedWord) {
            showToast('Please select a base word first!', 'warning');
            return;
        }

        this.showLoading('generate-derivatives-btn');

        try {
            // Get the selected word details
            const baseWordSelect = document.getElementById('base-word-select');
            const selectedOption = baseWordSelect.options[baseWordSelect.selectedIndex];
            const wordData = {
                english: selectedWord,
                conlang: selectedOption.dataset.conlang,
                pos: selectedOption.dataset.pos
            };

            console.log('Generating AI derivatives for:', wordData);

            const context = this.getLanguageContext();
            
            // Use AI if available
            let derivatives;
            if (this.localAI && this.localAI.initialized && this.localAI.apiEndpoint) {
                try {
                    derivatives = await this.generateAIDerivatives(context, wordData);
                } catch (error) {
                    console.log('AI derivative generation failed:', error.message);
                    derivatives = this.generateBasicDerivatives(wordData);
                }
            } else {
                derivatives = this.generateBasicDerivatives(wordData);
            }
            
            this.displayMorphologicalResults(derivatives, 'Derivatives', wordData.english);
            showToast(`Generated ${derivatives.length} derivatives!`, 'success');

        } catch (error) {
            console.error('Error generating derivatives:', error);
            showToast('Failed to generate derivatives', 'error');
        }

        this.hideLoading('generate-derivatives-btn');
    },


    // REAL AI-powered compound generation - replace in ai-assistant.js

async generateCompounds() {
    const selectedWord = document.getElementById('base-word-select')?.value;
    if (!selectedWord) {
        showToast('Please select a base word first!', 'warning');
        return;
    }

    this.showLoading('generate-compounds-btn');

    try {
        const baseWordSelect = document.getElementById('base-word-select');
        const selectedOption = baseWordSelect.options[baseWordSelect.selectedIndex];
        const wordData = {
            english: selectedWord,
            conlang: selectedOption.dataset.conlang,
            pos: selectedOption.dataset.pos
        };

        console.log('Generating AI compounds for:', wordData);

        const context = this.getLanguageContext();
        
        // Use AI if available
        let compounds;
        if (this.localAI && this.localAI.initialized && this.localAI.apiEndpoint) {
            try {
                compounds = await this.generateAICompounds(context, wordData);
            } catch (error) {
                console.log('AI compound generation failed:', error.message);
                compounds = this.generateBasicCompounds(context, wordData);
            }
        } else {
            compounds = this.generateBasicCompounds(context, wordData);
        }
        
        this.displayMorphologicalResults(compounds, 'Compound Words', wordData.english);
        showToast(`Generated ${compounds.length} compound words using "${wordData.english}"!`, 'success');

    } catch (error) {
        console.error('Error generating compounds:', error);
        showToast('Failed to generate compounds', 'error');
    }

    this.hideLoading('generate-compounds-btn');
},

// AI-POWERED DERIVATIVES
async generateAIDerivatives(context, baseWord) {
    try {
        const morphologyInfo = context.morphology && Object.keys(context.morphology).length > 0 ? 
            `Your language has these morphological features: ${JSON.stringify(context.morphology)}` :
            'Your language uses prefixes, suffixes, and infixes to create derived words.';

        const prompt = `You are creating derivative words for a constructed language by modifying the base word "${baseWord.english}" (conlang: "${baseWord.conlang}").

BASE WORD: ${baseWord.english} = ${baseWord.conlang} (${baseWord.pos})

${morphologyInfo}

TASK: Create 5 derivative forms by adding morphemes (prefixes, suffixes, infixes) to the conlang word "${baseWord.conlang}". 

Think about:
- Agent forms (person who does the action): add -er, -ar, -ist
- Result forms (result of the action): add -tion, -ment, -ing  
- Adjective forms: add -able, -ive, -ous
- Opposite forms: add un-, non-, anti-
- Diminutive/augmentative: add -let, -ling, -mega

Example: if base is "learn" (katal), you might create:
- katalar = learner (person who learns)
- katalum = learning/lesson (result of learning)
- katalik = learnable (able to learn)

Return ONLY a JSON object:
{
  "derivatives": [
    {
      "conlang": "modified conlang word",
      "english": "English meaning", 
      "pos": "noun/verb/adjective/adverb",
      "morpheme_added": "what was added to create this",
      "derivation_type": "agent/result/adjective/opposite/etc",
      "explanation": "why this derivation makes sense"
    }
  ]
}

Make the conlang derivatives by actually modifying "${baseWord.conlang}"!`;

        const response = await this.localAI.callAI(prompt);
        
        if (!response) {
            throw new Error('No response from AI');
        }

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }

        const result = JSON.parse(jsonMatch[0]);
        
        if (!result.derivatives || !Array.isArray(result.derivatives)) {
            throw new Error('Invalid response structure from AI');
        }

        return result.derivatives.map(derivative => ({
            conlang: derivative.conlang,
            english: derivative.english,
            pos: derivative.pos,
            derivation: `${baseWord.conlang} + ${derivative.morpheme_added}`,
            meaning: `${derivative.derivation_type}: ${derivative.explanation}`,
            baseWord: baseWord.english
        }));

    } catch (error) {
        console.error('Error in AI derivative generation:', error);
        throw error;
    }
},

// AI-POWERED WORD FAMILY
async generateAIWordFamily(context, baseWord) {
    try {
        const prompt = `You are creating a word family for a constructed language based on the root word "${baseWord.english}" (conlang: "${baseWord.conlang}").

BASE WORD: ${baseWord.english} = ${baseWord.conlang} (${baseWord.pos})

TASK: Create 5 related words in the same word family by modifying the conlang root "${baseWord.conlang}". Think of different forms, variations, and related concepts.

Examples of word family variations:
- Size variations: little, big, huge versions
- Intensity variations: mild, strong, extreme versions  
- Time variations: past, present, future forms
- Quality variations: good, bad, neutral versions
- Related concepts: similar meaning but different nuance

For "${baseWord.english}" (${baseWord.conlang}), create variations like:
- Different intensities or sizes
- Related but distinct meanings
- Grammatical variations
- Semantic extensions

Return ONLY a JSON object:
{
  "word_family": [
    {
      "conlang": "modified conlang word",
      "english": "English meaning",
      "pos": "noun/verb/adjective/adverb", 
      "variation_type": "diminutive/augmentative/intensive/etc",
      "relationship": "how this relates to the base word",
      "morphological_change": "what changed in the conlang word"
    }
  ]
}

Modify "${baseWord.conlang}" to create the family members!`;

        const response = await this.localAI.callAI(prompt);
        
        if (!response) {
            throw new Error('No response from AI');
        }

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }

        const result = JSON.parse(jsonMatch[0]);
        
        if (!result.word_family || !Array.isArray(result.word_family)) {
            throw new Error('Invalid response structure from AI');
        }

        return result.word_family.map(word => ({
            conlang: word.conlang,
            english: word.english,
            pos: word.pos,
            derivation: `${baseWord.conlang} → ${word.conlang} (${word.morphological_change})`,
            meaning: `${word.variation_type}: ${word.relationship}`,
            baseWord: baseWord.english
        }));

    } catch (error) {
        console.error('Error in AI word family generation:', error);
        throw error;
    }
},

// AI-POWERED COMPOUNDS (FIXED)
async generateAICompounds(context, baseWord) {
    try {
        const vocabularyList = context.vocabulary
            .filter(word => word.english.toLowerCase() !== baseWord.english.toLowerCase())
            .map(word => `${word.english} = ${word.conlang}`)
            .join(', ');

        const prompt = `You are creating compound words for a constructed language by combining the base word "${baseWord.english}" (conlang: "${baseWord.conlang}") with other words from the vocabulary.

BASE WORD: ${baseWord.english} = ${baseWord.conlang} (${baseWord.pos})

AVAILABLE VOCABULARY TO COMBINE WITH: ${vocabularyList}

TASK: Create 5 meaningful compound words by taking the conlang word "${baseWord.conlang}" and combining it with other conlang words from the vocabulary.

Examples of good compounds:
- fire + place = fireplace
- water + house = bathroom  
- hand + book = handbook
- sun + light = sunlight

For "${baseWord.english}" (${baseWord.conlang}), think of logical combinations:
1. ${baseWord.conlang} + another_conlang_word = new compound
2. another_conlang_word + ${baseWord.conlang} = new compound

Return ONLY a JSON object:
{
  "compounds": [
    {
      "conlang": "actual combined conlang words",
      "english": "compound meaning in English",
      "first_word": "first conlang word used",
      "second_word": "second conlang word used", 
      "combination_logic": "why these two make sense together",
      "pos": "noun/verb/adjective"
    }
  ]
}

IMPORTANT: Use actual conlang words from the vocabulary, not English words!`;

        const response = await this.localAI.callAI(prompt);
        
        if (!response) {
            throw new Error('No response from AI');
        }

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }

        const result = JSON.parse(jsonMatch[0]);
        
        if (!result.compounds || !Array.isArray(result.compounds)) {
            throw new Error('Invalid response structure from AI');
        }

        return result.compounds.map(compound => ({
            conlang: compound.conlang,
            english: compound.english,
            pos: compound.pos || 'noun',
            derivation: `${compound.first_word} + ${compound.second_word}`,
            meaning: compound.combination_logic,
            baseWords: [compound.first_word, compound.second_word]
        }));

    } catch (error) {
        console.error('Error in AI compound generation:', error);
        throw error;
    }
},

    // Simple fallbacks (non-hardcoded)
    generateBasicDerivatives(baseWord) {
        const derivatives = [];
        const base = baseWord.conlang;
        
        // Add some basic morphemes
        const morphemes = ['ar', 'um', 'ik', 'en', 'al'];
        
        morphemes.forEach((morpheme, index) => {
            derivatives.push({
                conlang: base + morpheme,
                english: `${baseWord.english}-derivative-${index + 1}`,
                pos: index < 2 ? 'noun' : index < 4 ? 'adjective' : 'verb',
                derivation: `${base} + -${morpheme}`,
                meaning: `Related to ${baseWord.english}`,
                baseWord: baseWord.english
            });
        });
        
        return derivatives;
    },

    generateBasicWordFamily(baseWord) {
        const family = [];
        const base = baseWord.conlang;
        
        const variations = ['eth', 'ok', 'il', 'an', 'est'];
        
        variations.forEach((variation, index) => {
            family.push({
                conlang: base + variation,
                english: `${baseWord.english}-variant-${index + 1}`,
                pos: baseWord.pos,
                derivation: `${base} + -${variation}`,
                meaning: `Variation of ${baseWord.english}`,
                baseWord: baseWord.english
            });
        });
        
        return family;
    },

    generateBasicCompounds(context, baseWord) {
        const compounds = [];
        const base = baseWord.conlang;
        
        // Get a few other words to combine with
        const otherWords = context.vocabulary
            .filter(word => word.english.toLowerCase() !== baseWord.english.toLowerCase())
            .slice(0, 5);
        
        otherWords.forEach(word => {
            compounds.push({
                conlang: base + word.conlang,
                english: `${baseWord.english}-${word.english}`,
                pos: 'noun',
                derivation: `${base} + ${word.conlang}`,
                meaning: `Combination of ${baseWord.english} and ${word.english}`,
                baseWords: [baseWord.english, word.english]
            });
        });
        
        return compounds;
    },
    // Simple fallback when AI is not available
    generateBasicCompounds(context, baseWord) {
        const vocabulary = context.vocabulary;
        const compounds = [];
        const baseEnglish = baseWord.english.toLowerCase();
        const baseConlang = baseWord.conlang;
        
        console.log(`Generating basic compounds for: ${baseEnglish}`);
        
        // Find other words to combine with (exclude the base word itself)
        const otherWords = vocabulary.filter(word => 
            word.english.toLowerCase() !== baseEnglish
        ).slice(0, 10); // Limit to 10 for performance
        
        // Generate a few combinations
        otherWords.slice(0, 5).forEach(word => {
            // Base word + other word
            compounds.push({
                conlang: baseConlang + word.conlang,
                english: `${baseWord.english}-${word.english}`,
                pos: 'noun',
                derivation: `${baseConlang} + ${word.conlang}`,
                meaning: `Something that combines ${baseWord.english} and ${word.english}`,
                baseWords: [baseWord.english, word.english]
            });
        });
        
        return compounds;
    },

    async expandWordFamily() {
        const selectedWord = document.getElementById('base-word-select')?.value;
        if (!selectedWord) {
            showToast('Please select a base word first!', 'warning');
            return;
        }

        this.showLoading('expand-word-family-btn');

        try {
            const baseWordSelect = document.getElementById('base-word-select');
            const selectedOption = baseWordSelect.options[baseWordSelect.selectedIndex];
            const wordData = {
                english: selectedWord,
                conlang: selectedOption.dataset.conlang,
                pos: selectedOption.dataset.pos
            };

            console.log('Generating AI word family for:', wordData);

            const context = this.getLanguageContext();
            
            // Use AI if available
            let wordFamily;
            if (this.localAI && this.localAI.initialized && this.localAI.apiEndpoint) {
                try {
                    wordFamily = await this.generateAIWordFamily(context, wordData);
                } catch (error) {
                    console.log('AI word family generation failed:', error.message);
                    wordFamily = this.generateBasicWordFamily(wordData);
                }
            } else {
                wordFamily = this.generateBasicWordFamily(wordData);
            }

            this.displayMorphologicalResults(wordFamily, 'Word Family', wordData.english);
            showToast(`Generated word family with ${wordFamily.length} related words!`, 'success');

        } catch (error) {
            console.error('Error expanding word family:', error);
            showToast('Failed to expand word family', 'error');
        }

        this.hideLoading('expand-word-family-btn');
    },

    // Simple derivative generation (fallback when AI is not available)
    generateSimpleDerivatives(baseWord) {
        const derivatives = [];
        const baseConlang = baseWord.conlang;
        
        // Common derivative patterns
        const patterns = [
            { suffix: 'ar', meaning: 'agent/doer', pos: 'noun', example: `${baseConlang}ar (one who ${baseWord.english}s)` },
            { suffix: 'um', meaning: 'result/product', pos: 'noun', example: `${baseConlang}um (result of ${baseWord.english}ing)` },
            { suffix: 'ik', meaning: 'adjective form', pos: 'adjective', example: `${baseConlang}ik (related to ${baseWord.english})` },
            { suffix: 'en', meaning: 'causative', pos: 'verb', example: `${baseConlang}en (to cause to ${baseWord.english})` },
            { suffix: 'al', meaning: 'place/location', pos: 'noun', example: `${baseConlang}al (place for ${baseWord.english}ing)` }
        ];
        
        patterns.forEach(pattern => {
            derivatives.push({
                conlang: baseConlang + pattern.suffix,
                english: `${baseWord.english}-${pattern.meaning}`,
                pos: pattern.pos,
                derivation: `${baseWord.conlang} + -${pattern.suffix}`,
                meaning: pattern.example,
                baseWord: baseWord.english
            });
        });
        
        return derivatives;
    },

    generateSimpleCompounds(context) {
        const vocabulary = context.vocabulary;
        const compounds = [];
        
        // Simple compound patterns
        const compoundPairs = [
            ['water', 'house', 'bathroom'],
            ['fire', 'place', 'fireplace'],
            ['sun', 'light', 'sunlight'],
            ['hand', 'book', 'handbook'],
            ['eye', 'water', 'tears']
        ];
        
        compoundPairs.forEach(([word1, word2, meaning]) => {
            const vocab1 = vocabulary.find(w => w.english.toLowerCase() === word1);
            const vocab2 = vocabulary.find(w => w.english.toLowerCase() === word2);
            
            if (vocab1 && vocab2) {
                compounds.push({
                    conlang: vocab1.conlang + vocab2.conlang,
                    english: meaning,
                    pos: 'noun',
                    derivation: `${vocab1.conlang} + ${vocab2.conlang}`,
                    meaning: `${word1} + ${word2} = ${meaning}`,
                    baseWords: [word1, word2]
                });
            }
        });
        
        return compounds;
    },

    generateWordFamily(baseWord) {
        const family = [];
        const base = baseWord.conlang;
        
        // Generate various related words
        const familyPatterns = [
            { form: base + 'eth', meaning: `${baseWord.english} (diminutive)`, pos: 'noun' },
            { form: base + 'ok', meaning: `${baseWord.english} (augmentative)`, pos: 'noun' },
            { form: base + 'il', meaning: `little ${baseWord.english}`, pos: 'noun' },
            { form: base + 'an', meaning: `${baseWord.english}-like`, pos: 'adjective' },
            { form: base + 'est', meaning: `most ${baseWord.english}`, pos: 'adjective' }
        ];
        
        familyPatterns.forEach(pattern => {
            family.push({
                conlang: pattern.form,
                english: pattern.meaning,
                pos: pattern.pos,
                derivation: `${baseWord.conlang} + morphological variation`,
                meaning: pattern.meaning,
                baseWord: baseWord.english
            });
        });
        
        return family;
    },

    displayMorphologicalResults(results, title, baseWord = '') {
        const resultDiv = document.getElementById('morphological-results');
        const contentDiv = document.getElementById('morphological-content');
        
        if (!resultDiv || !contentDiv) return;

        if (results.length === 0) {
            contentDiv.innerHTML = `
                <div class="morphological-expansion">
                    <p style="text-align: center; color: #666;">No ${title.toLowerCase()} could be generated.</p>
                </div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div class="morphological-expansion">
                    <div class="word-family">
                        <h5>${title}${baseWord ? ` for "${baseWord}"` : ''}</h5>
                        <div class="derived-words">
                            ${results.map((word, index) => `
                                <div class="derived-word">
                                    <div class="derived-word-info">
                                        <div class="derived-word-conlang">${word.conlang}</div>
                                        <div class="derived-word-meaning">${word.english} (${word.pos})</div>
                                        <div class="derived-word-process">${word.derivation || word.meaning}</div>
                                    </div>
                                    <button class="btn btn-sm btn-success" onclick="AIAssistant.addDerivedWord(${index})" style="margin-left: 10px;">
                                        ➕ Add
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        // Store results for adding
        this.currentMorphologicalResults = results;
        resultDiv.style.display = 'block';
    },

    addDerivedWord(index) {
        const word = this.currentMorphologicalResults[index];
        if (!word) return;

        // Create new word object
        const newWord = {
            english: word.english,
            conlang: word.conlang,
            pos: word.pos,
            meaning: word.meaning || word.english,
            source: 'ai_morphology',
            derivation: word.derivation,
            type: 'derived'
        };

        // Add to vocabulary using existing systems
        if (window.VocabularyModule && window.VocabularyModule.addWord) {
            window.VocabularyModule.addWord(newWord);
        } else {
            // Fallback method
            const allWords = window.appState ? window.appState.getState('allWords') || [] : [];
            allWords.push(newWord);
            if (window.appState) {
                window.appState.setState('allWords', allWords);
            }
        }

        // Update displays
        this.refreshMorphologyDropdowns();

        // Update the button to show it was added
        const button = document.querySelector(`button[onclick="AIAssistant.addDerivedWord(${index})"]`);
        if (button) {
            button.textContent = '✅ Added';
            button.disabled = true;
            button.style.opacity = '0.6';
        }

        showToast(`Added "${word.conlang}" meaning "${word.english}" to vocabulary!`, 'success');
        
        // Log activity
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added derived word "${word.conlang}" meaning "${word.english}"`, 'vocabulary');
        }
    },

    // FIXED: Cultural consistency analysis
    async checkCulturalConsistency() {
        this.showLoading('check-consistency-btn');

        try {
            console.log('Checking cultural consistency...');
            const context = this.getLanguageContext();
            
            // Check if we have cultural settings and vocabulary
            if (!context.culture || Object.keys(context.culture).length === 0) {
                showToast('No cultural settings found. Please configure your culture first!', 'warning');
                this.hideLoading('check-consistency-btn');
                return;
            }
            
            if (!context.vocabulary || context.vocabulary.length === 0) {
                showToast('No vocabulary found. Please add some words first!', 'warning');
                this.hideLoading('check-consistency-btn');
                return;
            }

            // Try AI analysis first, fallback to simple analysis
            let analysis;
            if (this.localAI && this.localAI.initialized && this.localAI.apiEndpoint) {
                try {
                    analysis = await this.localAI.analyzeCulturalConsistency(context);
                } catch (error) {
                    console.log('AI cultural analysis failed, using simple analysis:', error.message);
                    analysis = this.generateSimpleCulturalAnalysis(context);
                }
            } else {
                console.log('AI not available, using simple cultural analysis');
                analysis = this.generateSimpleCulturalAnalysis(context);
            }
            
            this.displayConsistencyAnalysis(analysis);
            showToast('Cultural consistency analysis completed!', 'success');

        } catch (error) {
            console.error('Error checking cultural consistency:', error);
            showToast('Failed to analyze cultural consistency', 'error');
        }

        this.hideLoading('check-consistency-btn');
    },

    async suggestCulturalVocabulary() {
        this.showLoading('suggest-cultural-vocab-btn');

        try {
            console.log('Suggesting cultural vocabulary...');
            const context = this.getLanguageContext();
            
            // Check if we have cultural settings
            if (!context.culture || Object.keys(context.culture).length === 0) {
                showToast('No cultural settings found. Please configure your culture first!', 'warning');
                this.hideLoading('suggest-cultural-vocab-btn');
                return;
            }

            // Try AI suggestions first, fallback to simple suggestions
            let suggestions;
            if (this.localAI && this.localAI.initialized && this.localAI.apiEndpoint) {
                try {
                    suggestions = await this.localAI.generateCulturalVocabulary(context);
                } catch (error) {
                    console.log('AI cultural vocabulary failed, using simple suggestions:', error.message);
                    suggestions = this.generateSimpleCulturalVocabulary(context);
                }
            } else {
                console.log('AI not available, using simple cultural vocabulary');
                suggestions = this.generateSimpleCulturalVocabulary(context);
            }
            
            this.displayCulturalVocabulary(suggestions);
            showToast('Cultural vocabulary suggestions generated!', 'success');

        } catch (error) {
            console.error('Error suggesting cultural vocabulary:', error);
            showToast('Failed to suggest cultural vocabulary', 'error');
        }

        this.hideLoading('suggest-cultural-vocab-btn');
    },

    // Simple cultural analysis (fallback when AI is not available)
    generateSimpleCulturalAnalysis(context) {
        const culture = context.culture;
        const vocabulary = context.vocabulary;
        
        const analysis = {
            consistency_score: 75, // Default reasonable score
            issues: [],
            cultural_strengths: [],
            missing_cultural_vocabulary: []
        };
        
        // Analyze based on environment
        if (culture.environment) {
            const environment = culture.environment.toLowerCase();
            const environmentWords = vocabulary.filter(word => 
                this.isEnvironmentRelated(word.english, environment)
            );
            
            if (environmentWords.length > 5) {
                analysis.cultural_strengths.push({
                    aspect: `${environment} environment vocabulary`,
                    supporting_vocabulary: environmentWords.slice(0, 5).map(w => w.english)
                });
            } else {
                analysis.missing_cultural_vocabulary.push({
                    domain: `${environment} environment`,
                    missing_words: this.getEnvironmentWords(environment),
                    importance: `Essential for ${environment} societies`
                });
            }
        }
        
        // Analyze technology level
        if (culture.technologyLevel) {
            const techLevel = culture.technologyLevel.toLowerCase();
            const modernWords = vocabulary.filter(word => 
                this.isModernWord(word.english)
            );
            
            if (techLevel.includes('stone') || techLevel.includes('bronze') || techLevel.includes('medieval')) {
                if (modernWords.length > 0) {
                    analysis.issues.push({
                        type: 'anachronism',
                        description: `Modern words found in ${techLevel} society`,
                        words_involved: modernWords.slice(0, 3).map(w => w.english),
                        severity: 'medium',
                        suggestion: 'Replace with period-appropriate alternatives'
                    });
                    analysis.consistency_score -= 15;
                }
            }
        }
        
        // Check social structure
        if (culture.socialStructure) {
            const socialWords = vocabulary.filter(word => 
                this.isSocialWord(word.english)
            );
            
            if (socialWords.length < 3) {
                analysis.missing_cultural_vocabulary.push({
                    domain: 'social relationships',
                    missing_words: ['leader', 'family', 'community', 'elder', 'child'],
                    importance: 'Essential for describing social interactions'
                });
            }
        }
        
        return analysis;
    },

    // Simple cultural vocabulary suggestions
    generateSimpleCulturalVocabulary(context) {
        const culture = context.culture;
        const suggestions = [];
        
        // Environment-based suggestions
        if (culture.environment) {
            const environment = culture.environment.toLowerCase();
            const environmentWords = this.getEnvironmentWords(environment);
            
            environmentWords.forEach(word => {
                suggestions.push({
                    english: word,
                    pos: this.guessPartOfSpeech(word),
                    category: `${environment} environment`,
                    priority: 8,
                    reasoning: `Essential for ${environment} societies`,
                    confidence: 0.9
                });
            });
        }
        
        // Technology level suggestions
        if (culture.technologyLevel) {
            const techLevel = culture.technologyLevel.toLowerCase();
            const techWords = this.getTechnologyWords(techLevel);
            
            techWords.forEach(word => {
                suggestions.push({
                    english: word,
                    pos: this.guessPartOfSpeech(word),
                    category: `${techLevel} technology`,
                    priority: 7,
                    reasoning: `Appropriate for ${techLevel} societies`,
                    confidence: 0.8
                });
            });
        }
        
        // Social structure suggestions
        if (culture.socialStructure) {
            const socialWords = ['leader', 'elder', 'community', 'family', 'tradition'];
            
            socialWords.forEach(word => {
                suggestions.push({
                    english: word,
                    pos: this.guessPartOfSpeech(word),
                    category: 'social structure',
                    priority: 9,
                    reasoning: 'Essential for social organization',
                    confidence: 0.95
                });
            });
        }
        
        return suggestions.slice(0, 10); // Limit to 10 suggestions
    },

    // Helper methods for cultural analysis
    isEnvironmentRelated(word, environment) {
        const environmentalWords = {
            'desert': ['sand', 'dune', 'oasis', 'camel', 'heat', 'dry', 'sun', 'water', 'scarce'],
            'forest': ['tree', 'wood', 'leaf', 'hunt', 'deer', 'bear', 'green', 'shade', 'wild'],
            'mountain': ['peak', 'snow', 'cold', 'climb', 'stone', 'high', 'wind', 'valley'],
            'coastal': ['sea', 'fish', 'boat', 'wave', 'salt', 'tide', 'shore', 'ocean'],
            'arctic': ['ice', 'snow', 'cold', 'seal', 'whale', 'freeze', 'white', 'winter']
        };
        
        const words = environmentalWords[environment] || [];
        return words.some(envWord => word.toLowerCase().includes(envWord));
    },

    isModernWord(word) {
        const modernWords = ['computer', 'internet', 'phone', 'car', 'airplane', 'electricity', 'plastic', 'television'];
        return modernWords.some(modern => word.toLowerCase().includes(modern));
    },

    isSocialWord(word) {
        const socialWords = ['leader', 'chief', 'elder', 'family', 'tribe', 'community', 'friend', 'enemy', 'ally'];
        return socialWords.some(social => word.toLowerCase().includes(social));
    },

    getEnvironmentWords(environment) {
        const environmentWords = {
            'desert': ['oasis', 'dune', 'sand', 'camel', 'mirage'],
            'forest': ['grove', 'clearing', 'undergrowth', 'canopy', 'wildlife'],
            'mountain': ['peak', 'valley', 'cliff', 'summit', 'avalanche'],
            'coastal': ['harbor', 'reef', 'tide', 'lighthouse', 'anchor'],
            'arctic': ['igloo', 'blizzard', 'glacier', 'tundra', 'aurora']
        };
        
        return environmentWords[environment] || ['nature', 'land', 'weather', 'animal', 'plant'];
    },

    getTechnologyWords(techLevel) {
        const techWords = {
            'stone': ['spear', 'flint', 'fire', 'cave', 'hunt'],
            'bronze': ['bronze', 'metal', 'tool', 'wheel', 'pottery'],
            'iron': ['iron', 'sword', 'plow', 'forge', 'smith'],
            'medieval': ['castle', 'knight', 'armor', 'siege', 'guild'],
            'industrial': ['machine', 'factory', 'steam', 'coal', 'railroad'],
            'modern': ['engine', 'radio', 'medicine', 'school', 'hospital']
        };
        
        return techWords[techLevel] || ['tool', 'craft', 'make', 'build', 'work'];
    },

    displayConsistencyAnalysis(analysis) {
        const resultDiv = document.getElementById('consistency-results');
        const contentDiv = document.getElementById('consistency-content');
        
        if (!resultDiv || !contentDiv) return;

        contentDiv.innerHTML = `
            <div class="cultural-analysis">
                <div class="cultural-score">
                    <h5>Cultural Consistency Score: ${analysis.consistency_score}%</h5>
                    <div style="background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0;">
                        <div style="background: linear-gradient(90deg, #dc3545 0%, #ffc107 50%, #28a745 100%); width: ${analysis.consistency_score}%; height: 20px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                ${analysis.cultural_strengths && analysis.cultural_strengths.length > 0 ? `
                    <div style="margin: 20px 0;">
                        <h6>🌟 Cultural Strengths</h6>
                        ${analysis.cultural_strengths.map(strength => `
                            <div class="consistency-item">
                                <div class="consistency-icon good">✅</div>
                                <div class="consistency-info">
                                    <div class="consistency-title">${strength.aspect}</div>
                                    <div class="consistency-description">Supporting words: ${strength.supporting_vocabulary.join(', ')}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${analysis.issues && analysis.issues.length > 0 ? `
                    <div style="margin: 20px 0;">
                        <h6>⚠️ Cultural Issues</h6>
                        ${analysis.issues.map(issue => `
                            <div class="consistency-item">
                                <div class="consistency-icon ${issue.severity === 'high' ? 'issue' : 'warning'}">${issue.severity === 'high' ? '❌' : '⚠️'}</div>
                                <div class="consistency-info">
                                    <div class="consistency-title">${issue.description}</div>
                                    <div class="consistency-description">
                                        Words: ${issue.words_involved.join(', ')}<br>
                                        Suggestion: ${issue.suggestion}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${analysis.missing_cultural_vocabulary && analysis.missing_cultural_vocabulary.length > 0 ? `
                    <div style="margin: 20px 0;">
                        <h6>🎯 Missing Cultural Vocabulary</h6>
                        ${analysis.missing_cultural_vocabulary.map(domain => `
                            <div class="consistency-item">
                                <div class="consistency-icon warning">📝</div>
                                <div class="consistency-info">
                                    <div class="consistency-title">${domain.domain}</div>
                                    <div class="consistency-description">
                                        Suggested words: ${domain.missing_words.join(', ')}<br>
                                        ${domain.importance}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        resultDiv.style.display = 'block';
    },

    displayCulturalVocabulary(suggestions) {
        const resultDiv = document.getElementById('consistency-results');
        const contentDiv = document.getElementById('consistency-content');
        
        if (!resultDiv || !contentDiv) return;

        if (suggestions.length === 0) {
            contentDiv.innerHTML = `
                <div class="cultural-analysis">
                    <h5>No Cultural Vocabulary Suggestions</h5>
                    <p>Your vocabulary already covers the main cultural areas, or no cultural context is available.</p>
                </div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div class="cultural-analysis">
                    <h5>🌟 Cultural Vocabulary Suggestions</h5>
                    <p>Words that would enhance your language's cultural authenticity:</p>
                    
                    <div class="missing-words-grid">
                        ${suggestions.map((word, index) => `
                            <div class="missing-word-card">
                                <div class="missing-word-header">
                                    <strong>${word.english}</strong>
                                    <span class="word-pos-tag">${word.pos}</span>
                                </div>
                                <div class="missing-word-meaning">Category: ${word.category}</div>
                                <div class="missing-word-priority">Priority: ${word.priority}/10</div>
                                <div style="font-size: 12px; color: #666; margin: 8px 0;">${word.reasoning}</div>
                                <div class="missing-word-actions">
                                    <button class="btn btn-sm btn-success" onclick="AIAssistant.addCulturalWord(${index})">
                                        ✨ Add to Vocabulary
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Store suggestions for adding
        this.currentCulturalSuggestions = suggestions;
        resultDiv.style.display = 'block';
    },

    addCulturalWord(index) {
        const word = this.currentCulturalSuggestions[index];
        if (!word) return;

        // Generate conlang word using existing systems
        const context = this.getLanguageContext();
        const finalConlangWord = window.VocabularyModule ? 
            window.VocabularyModule.generateWord(word.english, word.pos, context) :
            this.generateFallbackWord();
        
        // Add to vocabulary
        const newWord = {
            english: word.english,
            conlang: finalConlangWord,
            pos: word.pos || 'noun',
            meaning: word.english,
            source: 'ai_cultural',
            category: word.category
        };
        
        // Add using existing vocabulary system
        if (window.VocabularyModule && window.VocabularyModule.addWord) {
            window.VocabularyModule.addWord(newWord);
        } else {
            // Fallback method
            const allWords = window.appState ? window.appState.getState('allWords') || [] : [];
            allWords.push(newWord);
            if (window.appState) {
                window.appState.setState('allWords', allWords);
            }
        }

        // Update displays
        this.refreshMorphologyDropdowns();

        // Update the button to show it was added
        const button = document.querySelector(`button[onclick="AIAssistant.addCulturalWord(${index})"]`);
        if (button) {
            button.textContent = '✅ Added';
            button.disabled = true;
            button.style.opacity = '0.6';
        }

        showToast(`Added "${word.english}" → "${finalConlangWord}" to vocabulary!`, 'success');
        
        // Log activity
        if (window.ActivityModule) {
            window.ActivityModule.addActivity(`Added cultural word "${finalConlangWord}" meaning "${word.english}"`, 'vocabulary');
        }
    },

    // [Continue with existing methods...]
    async generateVocabularySuggestions() {
        const category = document.getElementById('suggestion-category')?.value || 'auto';
        const count = parseInt(document.getElementById('suggestion-count')?.value) || 10;

        this.showLoading('generate-suggestions-btn');

        try {
            // Check if AI is available
            if (!this.localAI || !this.localAI.initialized) {
                throw new Error('AI engine not initialized');
            }

            if (!this.localAI.apiEndpoint) {
                throw new Error('No AI provider available. Please check Ollama setup or configure cloud API.');
            }

            console.log('Generating vocabulary suggestions with AI...');
            
            // Get current language context
            const context = this.getLanguageContext();
            console.log('Language context:', context);
            
            // Generate suggestions using local AI
            const rawSuggestions = await this.localAI.generateVocabularySuggestions(context, category, count);
            console.log('Raw suggestions from AI:', rawSuggestions);
            
            // Let the vocabulary system handle duplicate checking now
            // Just do basic filtering for obviously bad suggestions
            const suggestions = rawSuggestions.filter(suggestion => {
                return suggestion.english && suggestion.english.trim().length > 0;
            });
            
            console.log(`Filtered suggestions (removed ${rawSuggestions.length - suggestions.length} invalid):`, suggestions);
            
            if (!suggestions || suggestions.length === 0) {
                showToast('AI returned no new suggestions (all were duplicates or invalid)', 'warning');
                return;
            }
            
            // Display suggestions
            this.displaySuggestions(suggestions);
            
            // Update stats
            this.stats.totalSuggestions += suggestions.length;
            this.updateStats();

            showToast(`Generated ${suggestions.length} vocabulary suggestions!`, 'success');

        } catch (error) {
            console.error('Error generating vocabulary suggestions:', error);
            showToast(`Failed to generate suggestions: ${error.message}`, 'error');
            
            // Show debug info
            console.log('AI Debug Info:');
            console.log('- LocalAI initialized:', this.localAI?.initialized);
            console.log('- API endpoint:', this.localAI?.apiEndpoint);
            console.log('- Available models:', this.localAI?.availableModels);
            console.log('- Selected model:', this.localAI?.selectedModel);
        }

        this.hideLoading('generate-suggestions-btn');
    },

    async identifyMissingWords() {
        const input = document.getElementById('translation-input')?.value?.trim();
        if (!input) {
            showToast('Please enter text to analyze', 'warning');
            return;
        }

        this.showLoading('identify-missing-btn');

        try {
            console.log('Starting AI-powered word analysis...');
            const context = this.getLanguageContext();
            
            // Check if AI is available
            if (!this.localAI || !this.localAI.initialized) {
                console.log('AI not available, falling back to simple analysis');
                return await this.identifyMissingWordsSimple();
            }

            // Use AI to analyze the text and understand word relationships
            console.log('Calling AI for smart analysis...');
            const analysisResult = await this.analyzeTextWithAI(input, context);
            
            if (analysisResult.error) {
                console.log('AI analysis failed, using fallback:', analysisResult.error);
                return await this.identifyMissingWordsSimple();
            }

            this.displaySmartMissingWords(analysisResult);
            
            if (analysisResult.missing_concepts.length === 0) {
                showToast('All concepts in the text are covered by your vocabulary! 🎉', 'success');
            } else {
                showToast(`AI found ${analysisResult.missing_concepts.length} missing concepts (understanding conjugated forms)`, 'info');
            }

        } catch (error) {
            console.error('Error in AI word analysis:', error);
            showToast('AI analysis failed, using simple word matching', 'warning');
            return await this.identifyMissingWordsSimple();
        }

        this.hideLoading('identify-missing-btn');
    },

    async analyzeTextWithAI(text, context) {
        try {
            // Create a vocabulary list for the AI to reference
            const vocabularyList = context.vocabulary.map(word => 
                `${word.english} (${word.pos})`
            ).join(', ');

            const prompt = `You are analyzing English text to identify missing vocabulary for a constructed language dictionary.

CURRENT VOCABULARY (${context.vocabulary.length} words):
${vocabularyList}

ANALYZE THIS TEXT: "${text}"

Your task:
1. Identify ALL unique CONCEPTS/MEANINGS in the text
2. For each concept, determine if it exists in the vocabulary (understanding that words can have different forms)
3. Understand that "live/living/lived/lives" are all forms of the same concept "live"
4. Understand that "run/running/ran/runs" are all forms of the same concept "run"
5. Only mark a concept as "missing" if NO form of that word exists in the vocabulary

Return ONLY a JSON object with this exact structure:
{
  "available_concepts": [
    {"base_form": "live", "text_form": "living", "pos": "verb", "meaning": "to be alive"},
    {"base_form": "house", "text_form": "house", "pos": "noun", "meaning": "dwelling place"}
  ],
  "missing_concepts": [
    {"base_form": "work", "text_form": "working", "pos": "verb", "meaning": "to perform labor", "priority": 8},
    {"base_form": "beautiful", "text_form": "beautiful", "pos": "adjective", "meaning": "pleasing to look at", "priority": 6}
  ],
  "analysis_notes": "Found 2 available concepts and 2 missing concepts. 'Living' matches existing 'live' in vocabulary."
}

Important: Be intelligent about word relationships. If the vocabulary contains "live", then "living", "lived", "lives" should all be considered available. Only suggest truly missing base concepts.`;

            // Call AI with the analysis prompt
            const response = await this.localAI.callAI(prompt);
            
            if (!response) {
                throw new Error('No response from AI');
            }

            console.log('Raw AI response:', response);

            // Parse the JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in AI response');
            }

            const result = JSON.parse(jsonMatch[0]);
            
            // Validate the response structure
            if (!result.available_concepts || !result.missing_concepts) {
                throw new Error('Invalid response structure from AI');
            }

            console.log('AI analysis result:', result);
            return result;

        } catch (error) {
            console.error('Error in AI text analysis:', error);
            return { error: error.message };
        }
    },

    displaySmartMissingWords(analysisResult) {
        const resultDiv = document.getElementById('translation-results');
        const contentDiv = document.getElementById('translation-content');
        
        if (!resultDiv || !contentDiv) return;

        const { available_concepts, missing_concepts, analysis_notes } = analysisResult;

        if (missing_concepts.length === 0) {
            contentDiv.innerHTML = `
                <div class="translation-analysis">
                    <div class="translation-section">
                        <h5>✅ Complete Conceptual Coverage</h5>
                        <p>All concepts in the text are covered by your vocabulary!</p>
                        <div class="analysis-details">
                            <h6>📊 AI Analysis:</h6>
                            <p><em>${analysis_notes}</em></p>
                        </div>
                        <div class="word-coverage">
                            <h6>Available concepts (${available_concepts.length}):</h6>
                            <div class="available-words">
                                ${available_concepts.map(concept => 
                                    `<span class="available-word" title="${concept.meaning}">
                                        ${concept.text_form} → ${concept.base_form} (${concept.pos})
                                    </span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div class="translation-analysis">
                    <div class="translation-section">
                        <h5>🧠 AI-Powered Concept Analysis</h5>
                        <div class="analysis-details">
                            <p><strong>AI Analysis:</strong> <em>${analysis_notes}</em></p>
                        </div>
                        
                        <div class="coverage-stats">
                            <div class="coverage-item available">
                                <span class="coverage-number">${available_concepts.length}</span>
                                <span class="coverage-label">Available Concepts</span>
                            </div>
                            <div class="coverage-item missing">
                                <span class="coverage-number">${missing_concepts.length}</span>
                                <span class="coverage-label">Missing Concepts</span>
                            </div>
                        </div>
                    </div>

                    <div class="translation-section">
                        <h5>✅ Available Concepts (AI Recognized)</h5>
                        <div class="available-words">
                            ${available_concepts.map(concept => 
                                `<span class="available-word" title="${concept.meaning}">
                                    <strong>${concept.text_form}</strong> → ${concept.base_form} (${concept.pos})
                                </span>`
                            ).join('')}
                        </div>
                    </div>

                    <div class="translation-section">
                        <h5>🎯 Missing Concepts (Need to Add)</h5>
                        <div class="missing-words-grid">
                            ${missing_concepts.map((concept, index) => `
                                <div class="missing-word-card smart-analysis">
                                    <div class="missing-word-header">
                                        <strong>${concept.base_form}</strong>
                                        <span class="word-pos-tag">${concept.pos}</span>
                                        <span class="ai-badge">🧠 AI</span>
                                    </div>
                                    <div class="missing-word-form">Text form: "${concept.text_form}"</div>
                                    <div class="missing-word-meaning">${concept.meaning}</div>
                                    <div class="missing-word-priority">Priority: ${concept.priority || 5}/10</div>
                                    <div class="missing-word-actions">
                                        <button class="btn btn-sm btn-success" 
                                                onclick="AIAssistant.addSmartMissingWord('${concept.base_form}', '${concept.pos}', '${concept.meaning}', ${index})">
                                            ✨ Add to Vocabulary
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        resultDiv.style.display = 'block';
    },

    addSmartMissingWord(englishWord, pos, meaning, index) {
        try {
            // Generate the conlang word using existing systems
            const context = this.getLanguageContext();
            const finalConlangWord = window.VocabularyModule.generateWord(englishWord, pos, context);
            
            // Add to vocabulary
            const newWord = {
                english: englishWord,
                conlang: finalConlangWord,
                pos: pos || 'noun',
                meaning: meaning || englishWord,
                source: 'ai_smart_analysis'
            };
            
            window.VocabularyModule.addWord(newWord);
            
            // Remove the word card from display
            const wordCard = document.querySelector(`.missing-word-card:nth-child(${index + 1})`);
            if (wordCard) {
                wordCard.style.opacity = '0.5';
                wordCard.querySelector('button').disabled = true;
                wordCard.querySelector('button').textContent = '✅ Added';
            }
            
            showToast(`Added "${englishWord}" → "${finalConlangWord}" (${pos}) to vocabulary!`, 'success');
            
            // Log activity
            if (window.ActivityModule) {
                window.ActivityModule.addActivity(`Added word "${finalConlangWord}" meaning "${englishWord}" via AI smart analysis`, 'vocabulary');
            }
        } catch (error) {
            console.error('Error adding smart missing word:', error);
            showToast(`Error adding word: ${error.message}`, 'error');
        }
    },

    // Helper methods
    getLanguageContext() {
        // Get vocabulary from multiple possible sources
        let vocabulary = [];
        
        // Try app state first (most likely location)
        if (window.appState) {
            const allWords = window.appState.getState('allWords');
            if (allWords && Array.isArray(allWords)) {
                vocabulary = allWords;
                console.log(`Found ${vocabulary.length} words in appState`);
            }
        }
        
        // If no words in app state, try other locations
        if (vocabulary.length === 0) {
            // Try vocabulary module
            if (window.VocabularyModule && window.VocabularyModule.words) {
                vocabulary = window.VocabularyModule.words;
                console.log(`Found ${vocabulary.length} words in VocabularyModule`);
            }
            
            // Try generator state
            if (vocabulary.length === 0 && window.generator && window.generator.generatedWords) {
                vocabulary = window.generator.generatedWords;
                console.log(`Found ${vocabulary.length} words in generator`);
            }
        }

        // Ensure vocabulary has the right format
        vocabulary = vocabulary.map(word => {
            if (typeof word === 'string') {
                return { english: word, conlang: word, pos: 'unknown' };
            }
            return {
                english: word.english || word.word || 'unknown',
                conlang: word.conlang || word.generated || word.english || 'unknown',
                pos: word.pos || word.partOfSpeech || 'unknown',
                meaning: word.meaning || word.english || 'unknown'
            };
        });

        console.log('Final vocabulary context:', vocabulary.length, 'words');
        
        return {
            phonology: window.generator?.language?.phonology || {},
            morphology: window.generator?.language?.morphology || {},
            syntax: window.generator?.language?.syntax || {},
            culture: window.generator?.language?.culture || {},
            vocabulary: vocabulary,
            grammarRules: window.generator?.language?.grammarRules || []
        };
    },

    generateFallbackWord() {
        // Simple fallback word generation if main generator isn't available
        const consonants = ['p', 't', 'k', 'm', 'n', 'l', 'r', 's', 'h'];
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        
        let word = '';
        const length = 2 + Math.floor(Math.random() * 3); // 2-4 syllables
        
        for (let i = 0; i < length; i++) {
            word += consonants[Math.floor(Math.random() * consonants.length)];
            word += vowels[Math.floor(Math.random() * vowels.length)];
        }
        
        return word;
    },

    guessPartOfSpeech(word) {
        // Simple heuristics for POS guessing
        const word_lower = word.toLowerCase();
        
        // Common function words
        if (['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by'].includes(word_lower)) {
            return 'function';
        }
        
        // Pronouns
        if (['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'].includes(word_lower)) {
            return 'pronoun';
        }
        
        // Common verb endings
        if (word_lower.endsWith('ing') || word_lower.endsWith('ed') || word_lower.endsWith('es')) {
            return 'verb';
        }
        
        // Common adjective endings
        if (word_lower.endsWith('ly')) {
            return 'adverb';
        }
        
        if (word_lower.endsWith('ful') || word_lower.endsWith('less') || word_lower.endsWith('ous') || word_lower.endsWith('ive')) {
            return 'adjective';
        }
        
        // Common verbs
        const commonVerbs = ['is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'may', 'might'];
        if (commonVerbs.includes(word_lower)) {
            return 'verb';
        }
        
        // Default to noun for most content words
        return 'noun';
    },

    updateAnalysisOverview() {
        console.log('Updating analysis overview...');
        const context = this.getLanguageContext();
        console.log('Context for analysis:', context);
        
        // Update vocabulary count
        const vocabCountEl = document.getElementById('ai-vocab-count');
        if (vocabCountEl) {
            vocabCountEl.textContent = context.vocabulary.length;
            console.log(`Updated vocab count to: ${context.vocabulary.length}`);
        }

        // Calculate missing categories (simplified)
        const missingCategoriesEl = document.getElementById('ai-missing-categories');
        if (missingCategoriesEl && this.localAI) {
            const analysis = this.localAI.quickGapAnalysis(context);
            missingCategoriesEl.textContent = analysis.missingCategories || 0;
        }

        // Calculate completion percentage
        const completionEl = document.getElementById('ai-completion-percent');
        if (completionEl) {
            const completion = Math.min(100, Math.round((context.vocabulary.length / 500) * 100));
            completionEl.textContent = `${completion}%`;
        }

        // Cultural consistency score
        const culturalEl = document.getElementById('ai-cultural-consistency');
        if (culturalEl && this.localAI) {
            const score = this.localAI.quickCulturalCheck(context);
            culturalEl.textContent = score;
        }
    },

    updateStats() {
        // Update accuracy rate
        if (this.stats.totalSuggestions > 0) {
            this.stats.accuracyRate = Math.round((this.stats.acceptedSuggestions / this.stats.totalSuggestions) * 100);
        }

        // Update UI elements
        const elements = {
            'total-suggestions': this.stats.totalSuggestions,
            'accepted-suggestions': this.stats.acceptedSuggestions,
            'ai-added-words': this.stats.aiAddedWords,
            'accuracy-rate': this.stats.accuracyRate + '%'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Save stats
        this.saveStats();
    },

    showLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.innerHTML = '<div class="loading"></div> Processing...';
        }
    },

    hideLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            // Restore original text based on button ID
            const originalTexts = {
                'generate-suggestions-btn': '✨ Generate Smart Suggestions',
                'analyze-gaps-btn': '🔍 Analyze Vocabulary Gaps',
                'translate-text-btn': '🔄 Analyze & Translate',
                'identify-missing-btn': '🎯 Identify Missing Words Only',
                'generate-derivatives-btn': '📊 Generate Derivatives',
                'generate-compounds-btn': '🔗 Generate Compounds',
                'expand-word-family-btn': '👨‍👩‍👧‍👦 Expand Word Family',
                'check-consistency-btn': '🔍 Check Cultural Consistency',
                'suggest-cultural-vocab-btn': '🌟 Suggest Cultural Vocabulary',
                'test-remote-connection-btn': '🔗 Test Remote Connection'
            };
            button.innerHTML = originalTexts[buttonId] || '✨ Generate';
        }
    },

    // Enhanced settings management
    loadSettings() {
        const saved = localStorage.getItem('ai_assistant_settings');
        if (saved) {
            try {
                const savedSettings = JSON.parse(saved);
                this.settings = { ...this.settings, ...savedSettings };
                console.log('Loaded saved AI settings:', this.settings);
            } catch (error) {
                console.error('Error loading AI settings:', error);
            }
        }
    },

    saveSettings() {
        localStorage.setItem('ai_assistant_settings', JSON.stringify(this.settings));
        console.log('AI settings saved:', this.settings);
    },

    loadStats() {
        const saved = localStorage.getItem('ai_assistant_stats');
        if (saved) {
            this.stats = { ...this.stats, ...JSON.parse(saved) };
        }
    },

    saveStats() {
        localStorage.setItem('ai_assistant_stats', JSON.stringify(this.stats));
    },

    // Enhanced UI state update
    updateUIState() {
        // Update provider selection
        const providerSelect = document.getElementById('ai-provider');
        if (providerSelect) {
            providerSelect.value = this.settings.provider || 'local';
        }

        // Update API key field
        const apiKeyInput = document.getElementById('api-key-input');
        if (apiKeyInput && this.settings.apiKey) {
            apiKeyInput.value = this.settings.apiKey;
        }

        // Update remote endpoint
        const remoteEndpointInput = document.getElementById('remote-endpoint-input');
        if (remoteEndpointInput && this.settings.remoteEndpoint) {
            remoteEndpointInput.value = this.settings.remoteEndpoint;
        }

        // Update remote model
        const remoteModelInput = document.getElementById('remote-model-input');
        if (remoteModelInput && this.settings.remoteModel) {
            remoteModelInput.value = this.settings.remoteModel;
        }

        // Update OpenRouter model
        const openRouterModelSelect = document.getElementById('openrouter-model-select');
        if (openRouterModelSelect && this.settings.openRouterModel) {
            openRouterModelSelect.value = this.settings.openRouterModel;
        }

        // Show/hide API key section
        const apiKeySection = document.getElementById('api-key-section');
        if (apiKeySection) {
            const needsApiKey = ['openai', 'anthropic', 'openrouter'].includes(this.settings.provider);
            apiKeySection.style.display = needsApiKey ? 'block' : 'none';
        }

        // Show/hide remote Ollama section
        const remoteSection = document.getElementById('remote-ollama-section');
        if (remoteSection) {
            remoteSection.style.display = (this.settings.provider === 'remote_ollama') ? 'block' : 'none';
        }

        // Show/hide OpenRouter model section
        const openRouterModelSection = document.getElementById('openrouter-model-section');
        if (openRouterModelSection) {
            openRouterModelSection.style.display = (this.settings.provider === 'openrouter') ? 'block' : 'none';
        }

        console.log('UI state updated for provider:', this.settings.provider);
    },

    // Placeholder methods for other functionality (add more as needed)
    async translateText() {
        showToast('Translation feature coming soon!', 'info');
    },

    async analyzeVocabularyGaps() {
        showToast('Vocabulary gap analysis feature coming soon!', 'info');
    },

    displaySuggestions(suggestions) {
        showToast('Vocabulary suggestions display coming soon!', 'info');
    },

    async identifyMissingWordsSimple() {
        showToast('Simple word analysis fallback activated', 'warning');
    }
};