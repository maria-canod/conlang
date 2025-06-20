// Enhanced Phonology Module with IPA Builder and Orthography System
// Replace the PhonologyModule in phonology.js with this enhanced version

window.PhonologyModule = {
    selectedVowels: [],
    selectedConsonants: [],
    orthographyMap: {},
    currentMethod: 'simple',

    init() {
        console.log('Enhanced PhonologyModule initialized');
        this.bindEvents();
        this.populateFormFromLanguageData();
    },

    bindEvents() {
        // Main generate button
        const generateBtn = document.getElementById('generate-phonology-btn');
        if (generateBtn) {
            generateBtn.onclick = () => this.generatePhonology();
        }

        // Method switching
        const methodSelect = document.getElementById('phonology-method');
        if (methodSelect) {
            methodSelect.addEventListener('change', () => this.switchMethod());
        }

        // IPA button events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ipa-btn')) {
                this.toggleIPASound(e.target);
            }
        });

        // Orthography events
        const autoRomanizeBtn = document.getElementById('auto-romanize-btn');
        if (autoRomanizeBtn) {
            autoRomanizeBtn.onclick = () => this.autoRomanize();
        }

        const suggestBtn = document.getElementById('suggest-orthography-btn');
        if (suggestBtn) {
            suggestBtn.onclick = () => this.suggestOrthography();
        }

        const validateBtn = document.getElementById('validate-orthography-btn');
        if (validateBtn) {
            validateBtn.onclick = () => this.validateOrthography();
        }

        console.log('Enhanced phonology events bound');
    },

    switchMethod() {
        const method = document.getElementById('phonology-method')?.value || 'simple';
        this.currentMethod = method;

        // Hide all method sections
        document.querySelectorAll('.method-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected method
        if (method === 'preset') {
            this.showPresetMethod();
        } else {
            const targetSection = document.getElementById(`${method.split('-')[0]}-method`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        }

        // If switching to IPA builder, populate from existing data
        if (method === 'ipa-builder') {
            this.populateIPAFromSimple();
        }
    },

    showPresetMethod() {
        // Create or update the preset interface
        let presetSection = document.getElementById('preset-method');
        
        if (!presetSection) {
            // Create the preset section if it doesn't exist
            presetSection = document.createElement('div');
            presetSection.id = 'preset-method';
            presetSection.className = 'method-section';
            
            // Insert after the IPA method section
            const ipaSection = document.getElementById('ipa-method');
            if (ipaSection) {
                ipaSection.parentNode.insertBefore(presetSection, ipaSection.nextSibling);
            }
        }
        
        presetSection.style.display = 'block';
        presetSection.innerHTML = `
            <div class="preset-builder">
                <h4>🎭 Fantasy Sound System Presets</h4>
                <p style="margin-bottom: 20px; color: #666;">Choose from fictional language archetypes inspired by fantasy worlds and environments.</p>
                
                <div class="form-group">
                    <label for="preset-category" style="font-weight: 600;">Language Type</label>
                    <select id="preset-category" class="form-control">
                        <option value="">-- Choose a preset --</option>
                        <option value="elvish">🧝 Elvish (Flowing & Melodic)</option>
                        <option value="dwarven">⛏️ Dwarven (Harsh & Guttural)</option>
                        <option value="draconic">🐉 Draconic (Ancient & Powerful)</option>
                        <option value="celestial">⭐ Celestial (Ethereal & Pure)</option>
                        <option value="infernal">🔥 Infernal (Dark & Sinister)</option>
                        <option value="primal">🌿 Primal (Nature-based)</option>
                        <option value="mechanical">⚙️ Mechanical (Constructed)</option>
                        <option value="aquatic">🌊 Aquatic (Ocean-dwelling)</option>
                        <option value="aerial">💨 Aerial (Sky-bound)</option>
                        <option value="crystalline">💎 Crystalline (Mineral-based)</option>
                    </select>
                </div>
                
                <div id="preset-description" class="preset-info" style="display: none; margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <!-- Description will be populated here -->
                </div>
                
                <div class="form-group" style="margin-top: 20px;">
                    <button type="button" class="btn btn-primary" id="apply-preset-btn" style="width: 100%;" disabled>
                        🎵 Apply Selected Preset
                    </button>
                </div>
            </div>
        `;
        
        // Bind events for the preset system
        this.bindPresetEvents();
    },

    bindPresetEvents() {
        const presetSelect = document.getElementById('preset-category');
        const applyBtn = document.getElementById('apply-preset-btn');
        const descriptionDiv = document.getElementById('preset-description');
        
        if (presetSelect) {
            presetSelect.addEventListener('change', (e) => {
                const selectedPreset = e.target.value;
                
                if (selectedPreset) {
                    applyBtn.disabled = false;
                    descriptionDiv.style.display = 'block';
                    descriptionDiv.innerHTML = this.getPresetDescription(selectedPreset);
                } else {
                    applyBtn.disabled = true;
                    descriptionDiv.style.display = 'none';
                }
            });
        }
        
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const selectedPreset = presetSelect.value;
                if (selectedPreset) {
                    this.applyPreset(selectedPreset);
                }
            });
        }
    },

    getPresetDescription(presetType) {
        const descriptions = {
            elvish: `
                <strong>🧝 Elvish Language</strong><br>
                <strong>Vowels:</strong> Rich vowel system with front rounded vowels<br>
                <strong>Consonants:</strong> Soft sounds, many liquids and nasals<br>
                <strong>Feel:</strong> Flowing, melodic, nature-inspired<br>
                <strong>Example sounds:</strong> /l/, /r/, /n/, /m/, /s/, /f/, /j/
            `,
            dwarven: `
                <strong>⛏️ Dwarven Language</strong><br>
                <strong>Vowels:</strong> Simple, robust vowel system<br>
                <strong>Consonants:</strong> Many stops, fricatives, and clusters<br>
                <strong>Feel:</strong> Harsh, guttural, mountain-forged<br>
                <strong>Example sounds:</strong> /k/, /g/, /x/, /r/, /θ/, /ð/, /tʃ/
            `,
            draconic: `
                <strong>🐉 Draconic Language</strong><br>
                <strong>Vowels:</strong> Deep, resonant vowels<br>
                <strong>Consonants:</strong> Sibilants, fricatives, and uvulars<br>
                <strong>Feel:</strong> Ancient, powerful, intimidating<br>
                <strong>Example sounds:</strong> /ʃ/, /ʒ/, /χ/, /ʁ/, /s/, /z/, /ɣ/
            `,
            celestial: `
                <strong>⭐ Celestial Language</strong><br>
                <strong>Vowels:</strong> Pure, clear vowel tones<br>
                <strong>Consonants:</strong> Soft, aspirated sounds<br>
                <strong>Feel:</strong> Ethereal, pure, heavenly<br>
                <strong>Example sounds:</strong> /h/, /ɸ/, /s/, /l/, /j/, /w/
            `,
            infernal: `
                <strong>🔥 Infernal Language</strong><br>
                <strong>Vowels:</strong> Dark, back vowels<br>
                <strong>Consonants:</strong> Ejectives, pharyngeals, harsh fricatives<br>
                <strong>Feel:</strong> Dark, sinister, otherworldly<br>
                <strong>Example sounds:</strong> /qʼ/, /ħ/, /ʕ/, /x/, /ɣ/, /ʔ/
            `,
            primal: `
                <strong>🌿 Primal Language</strong><br>
                <strong>Vowels:</strong> Natural, earthy tones<br>
                <strong>Consonants:</strong> Clicks, nasals, natural sounds<br>
                <strong>Feel:</strong> Nature-based, organic, tribal<br>
                <strong>Example sounds:</strong> /m/, /n/, /ŋ/, /w/, /j/, /ʔ/
            `,
            mechanical: `
                <strong>⚙️ Mechanical Language</strong><br>
                <strong>Vowels:</strong> Precise, systematic vowels<br>
                <strong>Consonants:</strong> Stops, precise articulation<br>
                <strong>Feel:</strong> Constructed, logical, artificial<br>
                <strong>Example sounds:</strong> /p/, /t/, /k/, /b/, /d/, /g/, /s/
            `,
            aquatic: `
                <strong>🌊 Aquatic Language</strong><br>
                <strong>Vowels:</strong> Flowing, liquid-like transitions<br>
                <strong>Consonants:</strong> Liquids, nasals, soft fricatives<br>
                <strong>Feel:</strong> Fluid, oceanic, flowing<br>
                <strong>Example sounds:</strong> /l/, /r/, /m/, /n/, /w/, /β/, /ɣ/
            `,
            aerial: `
                <strong>💨 Aerial Language</strong><br>
                <strong>Vowels:</strong> Breathy, airy quality<br>
                <strong>Consonants:</strong> Fricatives, aspirated sounds<br>
                <strong>Feel:</strong> Light, airy, wind-like<br>
                <strong>Example sounds:</strong> /f/, /s/, /ʃ/, /h/, /θ/, /x/
            `,
            crystalline: `
                <strong>💎 Crystalline Language</strong><br>
                <strong>Vowels:</strong> Sharp, precise vowel qualities<br>
                <strong>Consonants:</strong> Ejectives, sharp stops<br>
                <strong>Feel:</strong> Sharp, mineral-like, precise<br>
                <strong>Example sounds:</strong> /pʼ/, /tʼ/, /kʼ/, /s/, /ʃ/, /t/
            `
        };
        
        return descriptions[presetType] || '';
    },

    applyPreset(presetType) {
        const presets = {
            elvish: {
                vowels: ['a', 'e', 'i', 'o', 'u', 'y', 'ø'],
                consonants: ['l', 'r', 'n', 'm', 's', 'f', 'v', 'j', 'w', 'θ', 'ð', 'ɲ', 'ʎ']
            },
            dwarven: {
                vowels: ['a', 'e', 'i', 'o', 'u', 'ʌ'],
                consonants: ['k', 'g', 'p', 'b', 't', 'd', 'x', 'ɣ', 'r', 'θ', 'ð', 'f', 'v', 'tʃ', 'dʒ']
            },
            draconic: {
                vowels: ['a', 'ɑ', 'e', 'i', 'o', 'ɔ', 'u'],
                consonants: ['ʃ', 'ʒ', 'χ', 'ʁ', 's', 'z', 'ɣ', 'r', 'l', 'k', 'g', 'θ', 'ð']
            },
            celestial: {
                vowels: ['a', 'e', 'i', 'o', 'u'],
                consonants: ['h', 'ɸ', 's', 'l', 'j', 'w', 'm', 'n', 'r']
            },
            infernal: {
                vowels: ['ɑ', 'ɔ', 'o', 'u', 'ʌ', 'ə'],
                consonants: ['qʼ', 'ħ', 'ʕ', 'x', 'ɣ', 'ʔ', 'r', 'l', 'k', 'g']
            },
            primal: {
                vowels: ['a', 'e', 'i', 'o', 'u', 'ə'],
                consonants: ['m', 'n', 'ŋ', 'w', 'j', 'ʔ', 'h', 'k', 'g', 'p', 't']
            },
            mechanical: {
                vowels: ['a', 'e', 'i', 'o', 'u'],
                consonants: ['p', 't', 'k', 'b', 'd', 'g', 's', 'z', 'f', 'v', 'l', 'r']
            },
            aquatic: {
                vowels: ['a', 'e', 'i', 'o', 'u', 'ə'],
                consonants: ['l', 'r', 'm', 'n', 'w', 'β', 'ɣ', 'f', 'v', 'j']
            },
            aerial: {
                vowels: ['a', 'e', 'i', 'o', 'u'],
                consonants: ['f', 's', 'ʃ', 'h', 'θ', 'x', 'ɸ', 'p', 't', 'k']
            },
            crystalline: {
                vowels: ['a', 'e', 'i', 'o', 'u'],
                consonants: ['pʼ', 'tʼ', 'kʼ', 's', 'ʃ', 't', 'k', 'l', 'r', 'n']
            }
        };
        
        const preset = presets[presetType];
        if (!preset) {
            showToast('Invalid preset selected!', 'error');
            return;
        }
        
        // Apply the preset to simple inputs
        document.getElementById('vowels').value = preset.vowels.join(', ');
        document.getElementById('consonants').value = preset.consonants.join(', ');
        
        // Update the language object directly
        if (!window.generator.language.phonology) {
            window.generator.language.phonology = {};
        }
        
        window.generator.language.phonology.vowels = [...preset.vowels];
        window.generator.language.phonology.consonants = [...preset.consonants];
        
        // Generate syllable structures appropriate for the preset
        const syllableStructures = this.generateSyllableStructures(presetType);
        window.generator.language.phonology.syllableStructures = syllableStructures;
        
        showToast(`${presetType.charAt(0).toUpperCase() + presetType.slice(1)} preset applied successfully!`, 'success');
        
        // Auto-generate the phonology
        this.generatePhonology();
    },

    generateSyllableStructures(presetType) {
        const structures = {
            elvish: ['CV', 'CVC', 'V', 'CCV'],
            dwarven: ['CVC', 'CCVC', 'CVCC', 'CV'],
            draconic: ['CVC', 'CV', 'CCV', 'CCVC'],
            celestial: ['CV', 'CVC', 'V'],
            infernal: ['CVC', 'CVCC', 'CCV'],
            primal: ['CV', 'CVC', 'V'],
            mechanical: ['CVC', 'CV'],
            aquatic: ['CV', 'CVC', 'CCV'],
            aerial: ['CV', 'CVC', 'V'],
            crystalline: ['CVC', 'CV', 'CCVC']
        };
        
        return structures[presetType] || ['CV', 'CVC'];
    },


    populateIPAFromSimple() {
        // Get current simple input
        const vowelsInput = document.getElementById('vowels')?.value || '';
        const consonantsInput = document.getElementById('consonants')?.value || '';

        const vowels = vowelsInput.split(',').map(v => v.trim()).filter(v => v);
        const consonants = consonantsInput.split(',').map(c => c.trim()).filter(c => c);

        // Clear current selection
        this.selectedVowels = [];
        this.selectedConsonants = [];

        // Select corresponding IPA buttons
        vowels.forEach(vowel => {
            const btn = document.querySelector(`[data-ipa="${vowel}"]`);
            if (btn) {
                btn.classList.add('selected');
                this.selectedVowels.push(vowel);
            }
        });

        consonants.forEach(consonant => {
            const btn = document.querySelector(`[data-ipa="${consonant}"]`);
            if (btn) {
                btn.classList.add('selected');
                this.selectedConsonants.push(consonant);
            }
        });

        this.updateSelectedSounds();
    },

    toggleIPASound(button) {
        const ipa = button.dataset.ipa;
        const type = button.dataset.type;

        if (button.classList.contains('selected')) {
            // Remove sound
            button.classList.remove('selected');
            if (type === 'vowel') {
                this.selectedVowels = this.selectedVowels.filter(v => v !== ipa);
            } else {
                this.selectedConsonants = this.selectedConsonants.filter(c => c !== ipa);
            }
        } else {
            // Add sound
            button.classList.add('selected');
            if (type === 'vowel') {
                this.selectedVowels.push(ipa);
            } else {
                this.selectedConsonants.push(ipa);
            }
        }

        this.updateSelectedSounds();
    },

    updateSelectedSounds() {
        // Update counts
        document.getElementById('vowel-count').textContent = this.selectedVowels.length;
        document.getElementById('consonant-count').textContent = this.selectedConsonants.length;

        // Update displays
        const vowelDisplay = document.getElementById('selected-vowels-display');
        const consonantDisplay = document.getElementById('selected-consonants-display');

        vowelDisplay.innerHTML = this.selectedVowels.map(vowel => 
            `<span class="sound-chip">${vowel}<span class="remove-btn" onclick="PhonologyModule.removeSound('${vowel}', 'vowel')">×</span></span>`
        ).join('');

        consonantDisplay.innerHTML = this.selectedConsonants.map(consonant => 
            `<span class="sound-chip">${consonant}<span class="remove-btn" onclick="PhonologyModule.removeSound('${consonant}', 'consonant')">×</span></span>`
        ).join('');

        // Update simple inputs if in IPA mode
        if (this.currentMethod === 'ipa-builder') {
            document.getElementById('vowels').value = this.selectedVowels.join(', ');
            document.getElementById('consonants').value = this.selectedConsonants.join(', ');
        }
    },

    removeSound(sound, type) {
        // Remove from array
        if (type === 'vowel') {
            this.selectedVowels = this.selectedVowels.filter(v => v !== sound);
        } else {
            this.selectedConsonants = this.selectedConsonants.filter(c => c !== sound);
        }

        // Remove visual selection
        const btn = document.querySelector(`[data-ipa="${sound}"]`);
        if (btn) {
            btn.classList.remove('selected');
        }

        this.updateSelectedSounds();
    },

    generatePhonology() {
        console.log('Generating enhanced phonology...');

        let vowels, consonants;

        if (this.currentMethod === 'ipa-builder') {
            vowels = this.selectedVowels;
            consonants = this.selectedConsonants;
        } else {
            // Parse from simple inputs
            vowels = this.parseInput('vowels');
            consonants = this.parseInput('consonants');
        }

        if (vowels.length === 0) {
            showToast('Please select some vowels!', 'error');
            return;
        }

        if (consonants.length === 0) {
            showToast('Please select some consonants!', 'error');
            return;
        }

        // Update language phonology
        window.generator.language.phonology.vowels = vowels;
        window.generator.language.phonology.consonants = consonants;
        window.generator.language.phonology.syllableStructures = this.getSyllableStructures();

        // Generate syllables
        window.generator.language.phonology.syllables = [];
        const allSounds = [...vowels, ...consonants];
        
        for (let structure of window.generator.language.phonology.syllableStructures) {
            for (let i = 0; i < 30; i++) {
                let syllable = '';
                for (let char of structure) {
                    if (char === 'C') {
                        syllable += window.generator.randomChoice(consonants);
                    } else if (char === 'V') {
                        syllable += window.generator.randomChoice(vowels);
                    }
                }
                if (!window.generator.language.phonology.syllables.includes(syllable)) {
                    window.generator.language.phonology.syllables.push(syllable);
                }
            }
        }

        // Set environment
        const environmentSelect = document.getElementById('environment');
        if (environmentSelect) {
            window.generator.language.culture.environment = environmentSelect.value;
        }

        // Mark as user-set
        window.generator.userSet.phonology = true;

        // Display results
        this.displayPhonology(window.generator.language.phonology);

        // Show orthography section
        this.setupOrthographyMapping();

        // Add to activity
        if (window.ActivityModule) {
            window.ActivityModule.addActivity('Generated phonological system with orthography', 'phonology');
        }

        showToast('Phonology generated successfully!', 'success');
    },

    setupOrthographyMapping() {
        const allSounds = [
            ...window.generator.language.phonology.vowels,
            ...window.generator.language.phonology.consonants
        ];

        // Initialize orthography map if not exists
        if (Object.keys(this.orthographyMap).length === 0) {
            this.autoRomanize();
        }

        // Show orthography section
        const orthographySection = document.getElementById('orthography-section');
        if (orthographySection) {
            orthographySection.style.display = 'block';
        }

        this.renderOrthographyMapping();
    },

    autoRomanize() {
        const allSounds = [
            ...window.generator.language.phonology.vowels || [],
            ...window.generator.language.phonology.consonants || []
        ];

        // Smart romanization mappings
        const romanizations = {
            // Vowels
            'ə': '@',
            'ɛ': 'e',
            'ɔ': 'o', 
            'ɑ': 'a',
            'ɪ': 'i',
            'ʊ': 'u',
            'ʌ': 'u',
            'æ': 'ae',
            'ø': 'oe',
            'œ': 'oe',
            'ɨ': 'i',
            'ɯ': 'u',
            'ɤ': 'o',
            'ɐ': 'a',
            'y': 'y',

            // Consonants
            'ŋ': 'ng',
            'ʃ': 'sh',
            'ʒ': 'zh',
            'θ': 'th',
            'ð': 'dh',
            'χ': 'kh',
            'ɸ': 'ph',
            'β': 'bh',
            'ɣ': 'gh',
            'ʔ': "'",
            'ħ': 'h',
            'ʕ': "'",
            'ɲ': 'ny',
            'ʎ': 'ly',
            'ɬ': 'lh',
            'ɮ': 'lz',
            'ɾ': 'r',
            'ɽ': 'r',
            'ɻ': 'r',
            'ʀ': 'rr',
            'ʁ': 'r',
            'ʂ': 'sh',
            'ʐ': 'zh',
            'ɳ': 'n',
            'ɖ': 'd',
            'ɭ': 'l',
            'ʈ': 't',
            'ɟ': 'j',
            'ɡ': 'g',
            'ɢ': 'g',
            'ʡ': "'",
            'ɂ': "'",
            'ɕ': 'sh',
            'ʑ': 'zh',
            'j': 'y',
            'w': 'w'
        };

        // Apply romanizations
        allSounds.forEach(sound => {
            this.orthographyMap[sound] = romanizations[sound] || sound;
        });

        this.renderOrthographyMapping();
        this.updatePreview();
        showToast('Auto-romanization applied!', 'success');
    },

    suggestOrthography() {
        const allSounds = [
            ...window.generator.language.phonology.vowels || [],
            ...window.generator.language.phonology.consonants || []
        ];

        // Alternative suggestions for common sounds
        const suggestions = {
            'ʃ': ['sh', 'ch', 'š', 'x'],
            'ʒ': ['zh', 'j', 'ž', 'z'],
            'θ': ['th', 'þ', 't'],
            'ð': ['dh', 'ð', 'd'],
            'ŋ': ['ng', 'n', 'ñ'],
            'ə': ['@', 'e', 'a'],
            'ʔ': ["'", 'q', ''],
            'χ': ['kh', 'x', 'h'],
            'ɣ': ['gh', 'g', 'r']
        };

        let suggestedChanges = 0;
        Object.keys(this.orthographyMap).forEach(sound => {
            if (suggestions[sound]) {
                // Cycle through suggestions
                const currentMapping = this.orthographyMap[sound];
                const soundSuggestions = suggestions[sound];
                const currentIndex = soundSuggestions.indexOf(currentMapping);
                const nextIndex = (currentIndex + 1) % soundSuggestions.length;
                this.orthographyMap[sound] = soundSuggestions[nextIndex];
                suggestedChanges++;
            }
        });

        if (suggestedChanges > 0) {
            this.renderOrthographyMapping();
            this.updatePreview();
            showToast(`Applied ${suggestedChanges} alternative suggestions!`, 'success');
        } else {
            showToast('No alternative suggestions available for current sounds.', 'info');
        }
    },

    validateOrthography() {
        const mappings = Object.values(this.orthographyMap);
        const duplicates = mappings.filter((item, index) => mappings.indexOf(item) !== index);
        
        if (duplicates.length > 0) {
            const uniqueDuplicates = [...new Set(duplicates)];
            showToast(`Warning: Duplicate mappings found: ${uniqueDuplicates.join(', ')}`, 'error');
            return false;
        }

        const emptyMappings = Object.entries(this.orthographyMap)
            .filter(([sound, mapping]) => !mapping || mapping.trim() === '')
            .map(([sound]) => sound);

        if (emptyMappings.length > 0) {
            showToast(`Warning: Empty mappings for: ${emptyMappings.join(', ')}`, 'error');
            return false;
        }

        showToast('Orthography system validated successfully!', 'success');
        return true;
    },

    renderOrthographyMapping() {
        const mappingRows = document.getElementById('mapping-rows');
        if (!mappingRows) return;

        const allSounds = [
            ...window.generator.language.phonology.vowels || [],
            ...window.generator.language.phonology.consonants || []
        ];

        mappingRows.innerHTML = allSounds.map(sound => {
            const mapping = this.orthographyMap[sound] || sound;
            const examples = this.generateExamples(sound);
            
            return `
                <div class="mapping-row">
                    <div class="ipa-display">${sound}</div>
                    <div>
                        <input 
                            type="text" 
                            class="orthography-input" 
                            value="${mapping}"
                            onchange="PhonologyModule.updateMapping('${sound}', this.value)"
                            placeholder="Enter spelling..."
                        >
                    </div>
                    <div class="examples-text">${examples}</div>
                    <div>
                        <button class="btn btn-sm btn-secondary" onclick="PhonologyModule.resetMapping('${sound}')">↻</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    updateMapping(sound, newMapping) {
        this.orthographyMap[sound] = newMapping;
        this.updatePreview();
    },

    resetMapping(sound) {
        // Reset to original sound
        this.orthographyMap[sound] = sound;
        this.renderOrthographyMapping();
        this.updatePreview();
    },

    generateExamples(sound) {
        // Generate example syllables with this sound
        const vowels = window.generator.language.phonology.vowels || ['a', 'e', 'i'];
        const consonants = window.generator.language.phonology.consonants || ['p', 't', 'k'];
        
        const examples = [];
        
        if (vowels.includes(sound)) {
            // Vowel examples
            const randomC1 = consonants[Math.floor(Math.random() * consonants.length)];
            const randomC2 = consonants[Math.floor(Math.random() * consonants.length)];
            examples.push(`${randomC1}${sound}`, `${sound}${randomC2}`);
        } else {
            // Consonant examples  
            const randomV1 = vowels[Math.floor(Math.random() * vowels.length)];
            const randomV2 = vowels[Math.floor(Math.random() * vowels.length)];
            examples.push(`${sound}${randomV1}`, `${randomV1}${sound}${randomV2}`);
        }
        
        return examples.slice(0, 2).join(', ');
    },

    updatePreview() {
        // Generate sample words in both IPA and orthography
        const sampleWords = this.generateSampleWords();
        
        document.getElementById('ipa-examples').textContent = sampleWords.ipa.join(', ');
        document.getElementById('orthography-examples').textContent = sampleWords.orthography.join(', ');
    },

    generateSampleWords() {
        const vowels = window.generator.language.phonology.vowels || ['a'];
        const consonants = window.generator.language.phonology.consonants || ['k'];
        const structures = ['CV', 'CVC', 'CVCV'];
        
        const ipaWords = [];
        const orthoWords = [];
        
        for (let i = 0; i < 3; i++) {
            const structure = structures[i % structures.length];
            let ipaWord = '';
            let orthoWord = '';
            
            for (let char of structure) {
                if (char === 'C') {
                    const consonant = consonants[Math.floor(Math.random() * consonants.length)];
                    ipaWord += consonant;
                    orthoWord += this.orthographyMap[consonant] || consonant;
                } else if (char === 'V') {
                    const vowel = vowels[Math.floor(Math.random() * vowels.length)];
                    ipaWord += vowel;
                    orthoWord += this.orthographyMap[vowel] || vowel;
                }
            }
            
            ipaWords.push(ipaWord);
            orthoWords.push(orthoWord);
        }
        
        return { ipa: ipaWords, orthography: orthoWords };
    },

    displayPhonology(phonology) {
        console.log('Displaying enhanced phonology:', phonology);
        
        // Show the results section
        const resultsSection = document.getElementById('phonology-results');
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }

        const display = document.getElementById('phoneme-display');
        if (!display) return;

        display.innerHTML = `
            <div>
                <strong>Vowels (${phonology.vowels.length}):</strong>
                <div class="phoneme-display">
                    ${phonology.vowels.map(v => `<span class="phoneme">${v}</span>`).join('')}
                </div>
            </div>
            <div style="margin-top: 15px;">
                <strong>Consonants (${phonology.consonants.length}):</strong>
                <div class="phoneme-display">
                    ${phonology.consonants.map(c => `<span class="phoneme">${c}</span>`).join('')}
                </div>
            </div>
            <div style="margin-top: 15px;">
                <strong>Syllable Structures:</strong> ${phonology.syllableStructures.join(', ')}
            </div>
            <div style="margin-top: 15px;">
                <strong>Total Possible Syllables:</strong> ${phonology.syllables ? phonology.syllables.length : 0}
            </div>
        `;

        // Display orthography if available
        if (Object.keys(this.orthographyMap).length > 0) {
            this.displayOrthography();
        }
    },

    displayOrthography() {
        const orthographyDisplay = document.getElementById('orthography-display');
        if (!orthographyDisplay) return;

        const mappingEntries = Object.entries(this.orthographyMap);
        
        orthographyDisplay.innerHTML = `
            <div class="orthography-summary">
                <h5>✍️ Writing System</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-top: 10px;">
                    ${mappingEntries.map(([ipa, ortho]) => `
                        <div style="background: var(--bg-secondary); padding: 8px; border-radius: 4px; text-align: center;">
                            <div style="font-family: 'Times New Roman', serif; font-weight: bold;">${ipa}</div>
                            <div style="font-size: 0.8em; color: var(--text-secondary);">↓</div>
                            <div style="font-weight: bold; color: var(--accent-primary);">${ortho}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Helper functions
    parseInput(id) {
        const element = document.getElementById(id);
        if (!element) return [];
        
        return element.value
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
    },

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
    },

    populateFormFromLanguageData() {
        // Populate form fields with current language data if it exists
        if (window.generator && window.generator.language && window.generator.language.phonology) {
            const phonology = window.generator.language.phonology;
            
            if (phonology.vowels && phonology.vowels.length > 0) {
                document.getElementById('vowels').value = phonology.vowels.join(', ');
            }
            
            if (phonology.consonants && phonology.consonants.length > 0) {
                document.getElementById('consonants').value = phonology.consonants.join(', ');
            }
        }
        
        // Populate cultural environment
        if (window.generator && window.generator.language && window.generator.language.culture && window.generator.language.culture.environment) {
            const environmentSelect = document.getElementById('environment');
            if (environmentSelect) {
                environmentSelect.value = window.generator.language.culture.environment;
            }
        }
        
        // Display phonology results if they exist
        if (window.generator && window.generator.language && window.generator.language.phonology && 
            window.generator.language.phonology.vowels && window.generator.language.phonology.vowels.length > 0) {
            this.displayPhonology(window.generator.language.phonology);
        }
    },

    // Export orthography for use in other modules
    getOrthographyMap() {
        return this.orthographyMap;
    },

    // Convert IPA text to orthography
    convertToOrthography(ipaText) {
        let result = ipaText;
        Object.entries(this.orthographyMap).forEach(([ipa, ortho]) => {
            result = result.replace(new RegExp(ipa, 'g'), ortho);
        });
        return result;
    }
};