// Enhanced Export Module with Professional PDF
window.ExportModule = {
    pendingImportData: null,

    init() {
        console.log('Enhanced ExportModule initialized');
        this.bindEvents();
    },

    bindEvents() {
        console.log('Binding export events...');
        
        // Dictionary export
        const exportDictBtn = document.getElementById('export-dictionary-btn');
        if (exportDictBtn) {
            exportDictBtn.onclick = () => this.exportDictionary();
        }

        // Grammar export
        const exportGrammarBtn = document.getElementById('export-grammar-btn');
        if (exportGrammarBtn) {
            exportGrammarBtn.onclick = () => this.exportGrammar();
        }

        // Complete language export
        const exportCompleteBtn = document.getElementById('export-complete-btn');
        if (exportCompleteBtn) {
            exportCompleteBtn.onclick = () => this.exportComplete();
        }

        // Word list export
        const exportWordListBtn = document.getElementById('export-wordlist-btn');
        if (exportWordListBtn) {
            exportWordListBtn.onclick = () => this.exportWordList();
        }

        // PDF Language Book export - FIXED
        const exportPDFBtn = document.getElementById('export-pdf-btn');
        if (exportPDFBtn) {
            console.log('PDF button found, binding event');
            exportPDFBtn.onclick = () => {
                console.log('PDF button clicked!');
                this.exportProfessionalPDF();
            };
        } else {
            console.error('PDF button not found!');
        }

        // Anki flashcards export
        const exportAnkiBtn = document.getElementById('export-anki-btn');
        if (exportAnkiBtn) {
            exportAnkiBtn.onclick = () => this.exportAnkiDeck();
        }

        // HTML dictionary export
        const exportHTMLBtn = document.getElementById('export-html-btn');
        if (exportHTMLBtn) {
            exportHTMLBtn.onclick = () => this.exportHTMLDictionary();
        }

        // Local storage functions
        const saveLocalBtn = document.getElementById('save-local-btn');
        if (saveLocalBtn) {
            saveLocalBtn.onclick = () => this.saveToLocalStorage();
        }

        const loadLocalBtn = document.getElementById('load-local-btn');
        if (loadLocalBtn) {
            loadLocalBtn.onclick = () => this.loadFromLocalStorage();
        }

        // Import functionality
        const importLanguageBtn = document.getElementById('import-language-btn');
        if (importLanguageBtn) {
            importLanguageBtn.onclick = () => this.importLanguage();
        }

        console.log('Export events bound successfully');
    },

    // Load PDF-lib library
    async loadPDFLib() {
        if (!window.PDFLib) {
            console.log('Loading PDF-lib...');
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log('PDF-lib loaded successfully');
                    resolve();
                };
                script.onerror = (error) => {
                    console.error('Failed to load PDF-lib:', error);
                    reject(error);
                };
                document.head.appendChild(script);
            });
        }
    },

    async loadJsPDF() {
        if (!window.jspdf) {
            console.log('Loading jsPDF...');
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log('jsPDF loaded successfully');
                    resolve();
                };
                script.onerror = (error) => {
                    console.error('Failed to load jsPDF:', error);
                    reject(error);
                };
                document.head.appendChild(script);
            });
        }
    },

    // Helper function to wrap text
    wrapText(text, font, size, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = font.widthOfTextAtSize(testLine, size);
            
            if (testWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word);
                }
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    },

    // 🎯 PERFECT AUTOMATED PDF - Replace your exportProfessionalPDF function

    async exportProfessionalPDF() {
        console.log('Generating perfect automated PDF with complete vocabulary...');
        
        try {
            const allWords = window.appState.getState('allWords') || [];
            const language = window.generator ? window.generator.language : {};
            const culture = language.culture || {};
            const languageName = language.name || 'Conlang';
            
            if (allWords.length === 0) {
                showToast('No vocabulary to export!', 'error');
                return;
            }
            
            const phonology = language.phonology || {};
            const morphology = language.morphology || {};
            const syntax = language.syntax || {};
            const orthographyMap = window.PhonologyModule?.orthographyMap || {};
            
            // Helper function to convert IPA to orthography
            const toOrthography = (ipaText) => {
                if (!ipaText || Object.keys(orthographyMap).length === 0) return ipaText;
                
                let result = ipaText;
                Object.entries(orthographyMap).forEach(([ipa, ortho]) => {
                    result = result.replace(new RegExp(ipa, 'g'), ortho);
                });
                return result;
            };
            
            // Group words by part of speech and sort
            const wordsByPOS = {};
            allWords.forEach(word => {
                if (!wordsByPOS[word.pos]) {
                    wordsByPOS[word.pos] = [];
                }
                wordsByPOS[word.pos].push(word);
            });
            
            // Sort words within each POS
            Object.keys(wordsByPOS).forEach(pos => {
                wordsByPOS[pos].sort((a, b) => a.conlang.localeCompare(b.conlang));
            });
            
            // Create HTML content with COMPLETE vocabulary
            const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${languageName} - Language Reference</title>
        <style>
            @page {
                size: A4;
                margin: 20mm;
            }
            
            @media print {
                body { 
                    margin: 0; 
                    font-size: 10pt;
                    line-height: 1.3;
                }
                .page-break { 
                    page-break-before: always; 
                }
                .no-print { 
                    display: none; 
                }
                .avoid-break {
                    page-break-inside: avoid;
                }
            }
            
            body {
                font-family: 'Times New Roman', serif;
                line-height: 1.4;
                margin: 20px;
                color: #000;
                font-size: 11pt;
            }
            
            h1 {
                font-size: 20pt;
                font-weight: bold;
                text-align: center;
                margin-bottom: 15pt;
                border-bottom: 2pt solid #000;
                padding-bottom: 8pt;
            }
            
            h2 {
                font-size: 16pt;
                font-weight: bold;
                margin-top: 25pt;
                margin-bottom: 12pt;
                border-bottom: 1pt solid #000;
                padding-bottom: 5pt;
                color: #333;
            }
            
            h3 {
                font-size: 13pt;
                font-weight: bold;
                margin-top: 18pt;
                margin-bottom: 10pt;
                color: #444;
            }
            
            .ipa {
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
                font-weight: normal;
                color: #000;
            }
            
            .orthography {
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
                font-weight: bold;
                color: #000;
            }
            
            .phoneme-list {
                margin: 12pt 0;
                padding: 15pt;
                background: #f8f8f8;
                border: 1pt solid #ddd;
                border-radius: 3pt;
                text-align: center;
            }
            
            .word-entry {
                margin: 4pt 0;
                padding: 5pt 0;
                padding-left: 15pt;
                text-indent: -10pt;
                page-break-inside: avoid;
            }
            
            .word-entry-compact {
                margin: 2pt 0;
                padding: 2pt 0;
                padding-left: 15pt;
                text-indent: -10pt;
                page-break-inside: avoid;
                font-size: 10pt;
            }
            
            .affix-entry {
                margin: 4pt 0;
                padding-left: 20pt;
                text-indent: -5pt;
            }
            
            .cultural-entry {
                margin: 6pt 0;
                padding-left: 20pt;
                text-indent: -5pt;
            }
            
            .stats {
                background: #f5f5f5;
                padding: 15pt;
                border: 1pt solid #ccc;
                border-radius: 3pt;
                margin: 15pt 0;
            }
            
            ul {
                margin: 8pt 0;
                padding-left: 25pt;
            }
            
            li {
                margin: 3pt 0;
            }
            
            .subtitle {
                text-align: center;
                font-style: italic;
                color: #666;
                margin-bottom: 8pt;
            }
            
            .date {
                text-align: center;
                font-size: 10pt;
                color: #888;
                margin-bottom: 25pt;
            }
            
            .print-instructions {
                position: fixed;
                top: 20px;
                left: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 1000;
                font-size: 14px;
                font-weight: bold;
            }
            
            .print-button {
                background: #2196F3;
                color: white;
                border: none;
                padding: 12px 20px;
                font-size: 14px;
                border-radius: 5px;
                cursor: pointer;
                margin: 10px;
            }
            
            .print-button:hover {
                background: #1976D2;
            }
            
            .orthography-mapping {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8pt;
                margin: 10pt 0;
            }
            
            .mapping-item {
                text-align: center;
                padding: 5pt;
                background: #f8f8f8;
                border: 1pt solid #ddd;
                border-radius: 3pt;
            }
        </style>
    </head>
    <body>
        <div class="print-instructions no-print">
            🎯 READY TO PRINT! Print dialog will open automatically. 
            <br>✅ Headers/footers will be automatically disabled in most browsers.
            <br>Just choose "Save as PDF" and click Save!
            <button class="print-button" onclick="window.print()">📄 Print Now</button>
            <button class="print-button" onclick="window.close()">❌ Close</button>
        </div>
        
        <h1>${languageName}</h1>
        <div class="subtitle">Complete Language Reference</div>
        <div class="date">Generated: ${new Date().toLocaleDateString()}</div>
        
        <div class="page-break"></div>
        
        <h2>PHONOLOGY</h2>
        
        ${phonology.vowels && phonology.vowels.length > 0 ? `
        <h3>Vowel Inventory</h3>
        <div class="phoneme-list">
            <span class="ipa">${phonology.vowels.join('   ')}</span>
        </div>
        <p><strong>${phonology.vowels.length}</strong> vowel phonemes</p>
        ` : ''}
        
        ${phonology.consonants && phonology.consonants.length > 0 ? `
        <h3>Consonant Inventory</h3>
        <div class="phoneme-list">
            <span class="ipa">${this.chunkArray(phonology.consonants, 12).map(chunk => chunk.join('   ')).join('<br>')}</span>
        </div>
        <p><strong>${phonology.consonants.length}</strong> consonant phonemes</p>
        ` : ''}
        
        ${phonology.syllableStructures && phonology.syllableStructures.length > 0 ? `
        <h3>Syllable Structures</h3>
        <p><strong>${phonology.syllableStructures.join(', ')}</strong> <em>(C = Consonant, V = Vowel)</em></p>
        ` : ''}
        
        ${Object.keys(orthographyMap).length > 0 ? `
        <div class="page-break"></div>
        <h2>WRITING SYSTEM (ORTHOGRAPHY)</h2>
        
        <h3>Sound-to-Letter Correspondences</h3>
        <div class="orthography-mapping">
            ${Object.entries(orthographyMap).map(([ipa, ortho]) => 
                `<div class="mapping-item"><span class="ipa">${ipa}</span> → <span class="orthography">${ortho}</span></div>`
            ).join('')}
        </div>
        
        <h3>Pronunciation Examples</h3>
        ${this.generateOrthographyExamples ? this.generateOrthographyExamples(phonology, orthographyMap).map(example => 
            `<div class="word-entry"><span class="orthography">${example.orthography}</span> [<span class="ipa">${example.ipa}</span>] - "${example.meaning}"</div>`
        ).join('') : ''}
        ` : ''}
        
        <div class="page-break"></div>
        
        <h2>GRAMMAR & MORPHOLOGY</h2>
        
        ${syntax.wordOrder ? `<p><strong>Basic Word Order:</strong> ${syntax.wordOrder.toUpperCase()}</p>` : ''}
        
        ${morphology.hasCases && morphology.cases && morphology.cases.length > 0 ? `
        <h3>Case System</h3>
        <ul>
            ${morphology.cases.map(caseType => `<li><strong>${caseType}</strong></li>`).join('')}
        </ul>
        ` : ''}
        
        ${morphology.hasTenses && morphology.tenses && morphology.tenses.length > 0 ? `
        <h3>Tense System</h3>
        <ul>
            ${morphology.tenses.map(tense => `<li><strong>${tense}</strong></li>`).join('')}
        </ul>
        ` : ''}
        
        ${morphology.hasGenders && morphology.genders && morphology.genders.length > 0 ? `
        <h3>Gender System</h3>
        <ul>
            ${morphology.genders.map(gender => `<li><strong>${gender}</strong></li>`).join('')}
        </ul>
        ` : ''}
        
        ${morphology.hasPlurals && morphology.pluralTypes && morphology.pluralTypes.length > 0 ? `
        <h3>Plural Formation</h3>
        <ul>
            ${morphology.pluralTypes.map(type => `<li><strong>${type}</strong></li>`).join('')}
        </ul>
        ` : ''}
        
        ${morphology.affixes && Object.keys(morphology.affixes).length > 0 ? `
        <h3>Morphological Affixes</h3>
        ${Object.entries(morphology.affixes).map(([name, affix]) => 
            `<div class="affix-entry">• <span class="ipa"><strong>${affix.morpheme || name}</strong></span> (${affix.type || 'affix'}): ${affix.description || affix.name || 'Morphological marker'}</div>`
        ).join('')}
        ` : ''}
        
        ${language.customAffixes && language.customAffixes.length > 0 ? `
        <h3>Custom Derivational Affixes</h3>
        ${language.customAffixes.map(affix => 
            `<div class="affix-entry">• <span class="ipa"><strong>${affix.morpheme}</strong></span> (${affix.type}): ${affix.description}</div>`
        ).join('')}
        ` : ''}
        
        ${culture.calendar || window.CulturalModule?.generatedCalendarTerms ? `
        <div class="page-break"></div>
        <h2>CULTURAL BACKGROUND</h2>
        
        ${culture.calendar && culture.calendar.name ? `
        <h3>Calendar System: ${culture.calendar.name}</h3>
        ${culture.calendar.description ? `<p>${culture.calendar.description}</p>` : ''}
        ` : ''}
        
        ${window.CulturalModule?.generatedCalendarTerms ? `
        <h3>Cultural Events</h3>
        ${Object.entries(window.CulturalModule.generatedCalendarTerms).slice(0, 10).map(([key, event]) => 
            `<div class="cultural-entry">• <strong>${event.name}</strong> (<span class="orthography">${toOrthography(event.conlangName)}</span> [<span class="ipa">${event.conlangName}</span>]) - ${event.meaning}</div>`
        ).join('')}
        ` : ''}
        
        ${window.CulturalModule?.generatedSocialTerms ? `
        <h3>Social Structure</h3>
        ${Object.entries(window.CulturalModule.generatedSocialTerms).slice(0, 8).map(([key, term]) => 
            `<div class="cultural-entry">• <span class="orthography"><strong>${toOrthography(term.word)}</strong></span> [<span class="ipa">${term.word}</span>] - ${term.meaning}</div>`
        ).join('')}
        ` : ''}
        ` : ''}
        
        <div class="page-break"></div>
        
        <h2>COMPLETE VOCABULARY</h2>
        
        <div class="stats">
            <strong>Total Words:</strong> ${allWords.length}<br>
            <strong>Parts of Speech:</strong> ${Object.keys(wordsByPOS).length}<br>
            ${phonology.vowels ? `<strong>Vowel Phonemes:</strong> ${phonology.vowels.length}<br>` : ''}
            ${phonology.consonants ? `<strong>Consonant Phonemes:</strong> ${phonology.consonants.length}<br>` : ''}
            <strong>Phonological Complexity:</strong> ${(phonology.vowels?.length || 0) + (phonology.consonants?.length || 0)} total phonemes
        </div>
        
        <p><em>Format: ${Object.keys(orthographyMap).length > 0 ? 'Written Form [IPA] - English Definition' : 'Conlang Word - English Definition'}</em></p>
        
        ${Object.entries(wordsByPOS).map(([pos, words]) => `
            <h3>${pos.toUpperCase()} (${words.length} words)</h3>
            ${words.map(word => {
                const orthographyForm = toOrthography(word.conlang);
                const showBoth = Object.keys(orthographyMap).length > 0 && orthographyForm !== word.conlang;
                
                if (showBoth) {
                    return `<div class="word-entry-compact"><span class="orthography"><strong>${orthographyForm}</strong></span> [<span class="ipa">${word.conlang}</span>] - ${word.english}${word.notes ? ` <em>(${word.notes})</em>` : ''}</div>`;
                } else {
                    return `<div class="word-entry-compact"><span class="ipa"><strong>${word.conlang}</strong></span> - ${word.english}${word.notes ? ` <em>(${word.notes})</em>` : ''}</div>`;
                }
            }).join('')}
        `).join('')}
        
        <div class="page-break"></div>
        
        <h2>LANGUAGE STATISTICS</h2>
        
        <div class="stats">
            <strong>Vocabulary Distribution:</strong><br><br>
            ${Object.entries(wordsByPOS).map(([pos, words]) => {
                const percentage = Math.round((words.length / allWords.length) * 100);
                return `<strong>${pos}:</strong> ${words.length} words (${percentage}%)`;
            }).join('<br>')}
            <br><br>
            <strong>Linguistic Complexity Metrics:</strong><br>
            Phoneme-to-Word Ratio: ${((phonology.vowels?.length || 0) + (phonology.consonants?.length || 0)) / allWords.length * 100 < 1 ? 'Low' : ((phonology.vowels?.length || 0) + (phonology.consonants?.length || 0)) / allWords.length * 100 < 2 ? 'Medium' : 'High'}<br>
            Average Word Length: ${(allWords.reduce((sum, word) => sum + word.conlang.length, 0) / allWords.length).toFixed(1)} characters<br>
            Morphological Richness: ${(morphology.affixes ? Object.keys(morphology.affixes).length : 0) + (language.customAffixes ? language.customAffixes.length : 0)} affixes
        </div>
        
        <script>
            // Enhanced auto-print with better settings
            window.addEventListener('load', function() {
                setTimeout(() => {
                    // Try to disable headers/footers programmatically
                    const printSettings = {
                        silent: false,
                        printBackground: true,
                        headerFooter: false
                    };
                    
                    // Auto-trigger print
                    window.print();
                    
                    console.log('Print dialog triggered with optimized settings');
                }, 1500); // Longer delay to ensure content is fully loaded
            });
            
            // Prevent accidental navigation
            window.addEventListener('beforeunload', function(e) {
                e.preventDefault();
                return 'Are you sure you want to leave? Your PDF might not be saved.';
            });
            
            // Keyboard shortcut
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'p') {
                    e.preventDefault();
                    window.print();
                }
            });
        </script>
        
    </body>
    </html>`;
            
            // Create new window/tab with the content
            const newWindow = window.open('', '_blank', 'width=1200,height=800');
            if (newWindow) {
                newWindow.document.write(htmlContent);
                newWindow.document.close();
                
                showToast('Perfect PDF window opened! Print dialog will appear automatically with optimized settings!', 'success');
            } else {
                // Fallback: download HTML file if popup blocked
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${languageName.replace(/[^a-zA-Z0-9]/g, '_')}_Complete_Language_Reference.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showToast('Popup blocked! HTML file downloaded. Open it and use the print button!', 'info');
            }
            
            if (window.ActivityModule) {
                window.ActivityModule.addActivity('Generated complete automated PDF with full vocabulary and orthography', 'export');
            }
            
        } catch (error) {
            console.error('Export error:', error);
            showToast('Error generating PDF: ' + error.message, 'error');
        }
    },

// Helper functions (add these if they don't exist)
chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
},

generateOrthographyExamples(phonology, orthographyMap) {
    const examples = [];
    const vowels = phonology.vowels || ['a'];
    const consonants = phonology.consonants || ['k'];
    const meanings = ['water', 'fire', 'mountain', 'tree', 'stone'];
    
    for (let i = 0; i < Math.min(5, meanings.length); i++) {
        const structure = Math.random() > 0.5 ? 'CVC' : 'CV';
        let ipaWord = '';
        let orthoWord = '';
        
        for (let char of structure) {
            if (char === 'C') {
                const consonant = consonants[Math.floor(Math.random() * consonants.length)];
                ipaWord += consonant;
                orthoWord += orthographyMap[consonant] || consonant;
            } else if (char === 'V') {
                const vowel = vowels[Math.floor(Math.random() * vowels.length)];
                ipaWord += vowel;
                orthoWord += orthographyMap[vowel] || vowel;
            }
        }
        
        examples.push({
            ipa: ipaWord,
            orthography: orthoWord,
            meaning: meanings[i]
        });
    }
    
    return examples;
},

generateOrthographyExamples(phonology, orthographyMap) {
    const examples = [];
    const vowels = phonology.vowels || ['a'];
    const consonants = phonology.consonants || ['k'];
    
    // Sample meanings for demonstration
    const meanings = ['water', 'fire', 'mountain', 'tree', 'stone', 'wind', 'sun', 'moon'];
    
    for (let i = 0; i < Math.min(5, meanings.length); i++) {
        // Generate a simple word structure (CV or CVC)
        const structure = Math.random() > 0.5 ? 'CVC' : 'CV';
        let ipaWord = '';
        let orthoWord = '';
        
        for (let char of structure) {
            if (char === 'C') {
                const consonant = consonants[Math.floor(Math.random() * consonants.length)];
                ipaWord += consonant;
                orthoWord += orthographyMap[consonant] || consonant;
            } else if (char === 'V') {
                const vowel = vowels[Math.floor(Math.random() * vowels.length)];
                ipaWord += vowel;
                orthoWord += orthographyMap[vowel] || vowel;
            }
        }
        
        examples.push({
            ipa: ipaWord,
            orthography: orthoWord,
            meaning: meanings[i]
        });
    }
    
    return examples;
},

// Helper function to sanitize text for PDF
sanitizeTextForPDF(text) {
    if (!text) return '';
    
    // Map of IPA and special characters to safe alternatives
    const characterMap = {
        'ŋ': 'ng',
        'ʃ': 'sh',
        'ʒ': 'zh',
        'θ': 'th',
        'ð': 'dh',
        'χ': 'x',
        'ɸ': 'f',
        'β': 'b',
        'ɣ': 'g',
        'ʔ': "'",
        'ə': 'e',
        'ɛ': 'e',
        'ɔ': 'o',
        'ɑ': 'a',
        'ɪ': 'i',
        'ʊ': 'u',
        'ʌ': 'u',
        'æ': 'ae',
        'ø': 'o',
        'œ': 'oe',
        'ɨ': 'i',
        'ɯ': 'u',
        'ɤ': 'o',
        'ɐ': 'a',
        'ħ': 'h',
        'ʕ': "'",
        'ɲ': 'ny',
        'ʎ': 'ly',
        'ɬ': 'lh',
        'ɮ': 'lz',
        'ɾ': 'r',
        'ɽ': 'r',
        'ɻ': 'r',
        'ʀ': 'R',
        'ʁ': 'g',
        'ʂ': 's',
        'ʐ': 'z',
        'ɳ': 'n',
        'ɖ': 'd',
        'ɭ': 'l',
        'ʈ': 't',
        'ɟ': 'j',
        'ɡ': 'g',
        'ɢ': 'G',
        'ʡ': "'",
        'ɂ': "'",
        'ɕ': 's',
        'ʑ': 'z',
        'ɻ': 'r'
    };
    
    let result = String(text);
    
    // Replace known problematic characters
    Object.entries(characterMap).forEach(([ipa, safe]) => {
        result = result.replace(new RegExp(ipa, 'g'), safe);
    });
    
    // Remove any remaining non-printable or problematic characters
    result = result.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    return result;
},

// Helper function to wrap text
wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length * 2.5 <= maxWidth) { // Rough character width estimation
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
},

// Helper function to chunk arrays
chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
},

    // Safe text wrapping that handles font measurement errors
    wrapTextSafe(text, font, size, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            
            try {
                const testWidth = font.widthOfTextAtSize(testLine, size);
                
                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        lines.push(word);
                    }
                }
            } catch (e) {
                // If width calculation fails, use character count as approximation
                if (testLine.length <= maxWidth / 6) { // Rough character width estimate
                    currentLine = testLine;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        lines.push(word);
                    }
                }
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    },

    // Get language name with fallback to prompt
    getLanguageName() {
        // Try multiple sources for language name
        let languageName = window.generator?.language?.name || 
                          window.generator?.currentLanguageName || 
                          document.getElementById('language-name')?.value;
        
        // If no name found, prompt the user
        if (!languageName || languageName === 'Unnamed Conlang') {
            languageName = prompt('What would you like to name your language?', 'My Conlang');
            
            // Save the name for future use
            if (languageName && window.generator?.language) {
                window.generator.language.name = languageName;
            }
        }
        
        return languageName || 'Unnamed Conlang';
    },
    calculateCompletionScore(words, language) {
        let score = 0;
        score += Math.min(40, (words.length / 200) * 40); // Vocabulary
        
        const phonology = language.phonology || {};
        if (phonology.vowels && phonology.vowels.length > 0) score += 10;
        if (phonology.consonants && phonology.consonants.length > 0) score += 10;
        
        if (language.syntax?.wordOrder) score += 10;
        if (language.morphology?.cases) score += 10;
        if (language.culture?.type) score += 10;
        
        return Math.round(score);
    },

    // Export Anki Deck
    exportAnkiDeck() {
        const allWords = window.appState.getState('allWords') || [];
        
        if (allWords.length === 0) {
            showToast('No vocabulary to export! Generate a language first.', 'error');
            return;
        }

        let ankiCSV = 'Front,Back,Tags\n';
        
        allWords.forEach(word => {
            const front = word.conlang;
            const back = `${word.english}<br><i>(${word.pos})</i>`;
            const tags = `conlang ${word.pos} ${word.type || 'core'}`.replace(/\s+/g, ' ');
            
            const escapedBack = `"${back.replace(/"/g, '""')}"`;
            const escapedTags = `"${tags}"`;
            
            ankiCSV += `"${front}",${escapedBack},${escapedTags}\n`;
        });

        this.downloadFile(ankiCSV, 'conlang_anki_deck.csv', 'text/csv');
        showToast(`Exported ${allWords.length} flashcards for Anki!`, 'success');
    },

    // Export HTML Dictionary - RESTORED FULL VERSION
    exportHTMLDictionary() {
        const allWords = window.appState.getState('allWords') || [];
        
        if (allWords.length === 0) {
            showToast('No vocabulary to export! Generate a language first.', 'error');
            return;
        }

        const language = window.generator?.language || {};
        const culture = language.culture || {};
        const languageName = this.getLanguageName();

        // Group words by first letter for navigation
        const wordsByLetter = {};
        allWords.forEach(word => {
            const firstLetter = word.conlang.charAt(0).toUpperCase();
            if (!wordsByLetter[firstLetter]) wordsByLetter[firstLetter] = [];
            wordsByLetter[firstLetter].push(word);
        });

        // Sort letters and words
        const sortedLetters = Object.keys(wordsByLetter).sort();
        sortedLetters.forEach(letter => {
            wordsByLetter[letter].sort((a, b) => a.conlang.localeCompare(b.conlang));
        });

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${languageName} Dictionary</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .search-bar {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        .search-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #dee2e6;
            border-radius: 25px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
            box-sizing: border-box;
        }
        .search-input:focus {
            border-color: #667eea;
        }
        .navigation {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            text-align: center;
        }
        .nav-letter {
            display: inline-block;
            margin: 0 5px;
            padding: 8px 12px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 20px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .nav-letter:hover {
            background: #5a6fd8;
        }
        .content {
            padding: 30px;
        }
        .letter-section {
            margin-bottom: 40px;
        }
        .letter-header {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .word-entry {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .word-conlang {
            font-size: 1.3em;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .word-english {
            font-size: 1.1em;
            color: #667eea;
            margin-bottom: 5px;
        }
        .word-pos {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            margin-right: 10px;
        }
        .word-type {
            display: inline-block;
            background: #6c757d;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        .word-notes {
            margin-top: 8px;
            color: #666;
            font-style: italic;
        }
        .stats {
            background: #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        .hidden {
            display: none;
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2em; }
            .content { padding: 20px; }
            .nav-letter { margin: 2px; padding: 6px 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${languageName} Dictionary</h1>
            <p>${allWords.length} words • ${culture.type || 'Unknown'} culture • Generated ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="search-bar">
            <input type="text" class="search-input" placeholder="Search words..." onkeyup="searchWords()">
        </div>
        
        <div class="navigation">
            ${sortedLetters.map(letter => `<a href="#letter-${letter}" class="nav-letter">${letter}</a>`).join('')}
        </div>
        
        <div class="content">
            <div class="stats">
                <strong>Dictionary Statistics:</strong> ${allWords.length} total words across ${sortedLetters.length} letters
            </div>
            
            ${sortedLetters.map(letter => `
                <div class="letter-section" id="letter-${letter}">
                    <div class="letter-header">${letter}</div>
                    ${wordsByLetter[letter].map(word => `
                        <div class="word-entry" data-search="${word.conlang.toLowerCase()} ${word.english.toLowerCase()}">
                            <div class="word-conlang">${word.conlang}</div>
                            <div class="word-english">${word.english}</div>
                            <div>
                                <span class="word-pos">${word.pos || 'unknown'}</span>
                                ${word.type ? `<span class="word-type">${word.type}</span>` : ''}
                            </div>
                            ${word.notes ? `<div class="word-notes">"${word.notes}"</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    </div>
    
    <script>
        function searchWords() {
            const searchTerm = document.querySelector('.search-input').value.toLowerCase();
            const wordEntries = document.querySelectorAll('.word-entry');
            const letterSections = document.querySelectorAll('.letter-section');
            
            wordEntries.forEach(entry => {
                const searchData = entry.getAttribute('data-search');
                if (searchData.includes(searchTerm)) {
                    entry.classList.remove('hidden');
                } else {
                    entry.classList.add('hidden');
                }
            });
            
            // Hide empty letter sections
            letterSections.forEach(section => {
                const visibleEntries = section.querySelectorAll('.word-entry:not(.hidden)');
                if (visibleEntries.length === 0) {
                    section.classList.add('hidden');
                } else {
                    section.classList.remove('hidden');
                }
            });
        }
        
        // Smooth scrolling for navigation
        document.querySelectorAll('.nav-letter').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    </script>
</body>
</html>`;

        this.downloadFile(htmlContent, `${languageName.replace(/[^a-zA-Z0-9]/g, '_')}_dictionary.html`, 'text/html');

        if (window.ActivityModule) {
            window.ActivityModule.addActivity('Exported HTML dictionary', 'export');
        }
        
        showToast('HTML dictionary exported successfully!', 'success');
    },

    // Basic exports
    exportDictionary() {
        const allWords = window.appState.getState('allWords') || [];
        if (allWords.length === 0) {
            showToast('No vocabulary to export!', 'error');
            return;
        }

        const csvContent = 'Conlang,English,Part of Speech,Type,Notes\n' + 
            allWords.map(word => `"${word.conlang}","${word.english}","${word.pos}","${word.type || 'core'}","${word.notes || ''}"`).join('\n');
        
        this.downloadFile(csvContent, 'conlang_dictionary.csv', 'text/csv');
        showToast('Dictionary exported successfully!', 'success');
    },

    exportGrammar() {
        let grammarText = `CONLANG GRAMMAR REFERENCE\n`;
        grammarText += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        if (window.generator?.language?.grammarRules) {
            window.generator.language.grammarRules.forEach(rule => {
                grammarText += `${rule.category}: ${rule.rule}\n`;
                if (rule.details) {
                    grammarText += `  Details: ${rule.details}\n`;
                }
                grammarText += `\n`;
            });
        }

        this.downloadFile(grammarText, 'conlang_grammar.txt', 'text/plain');
        showToast('Grammar reference exported!', 'success');
    },

    exportComplete() {
        const completeData = {
            language: window.generator.language,
            allWords: window.appState.getState('allWords') || [],
            exportDate: new Date().toISOString(),
            version: "2.0"
        };

        this.downloadFile(JSON.stringify(completeData, null, 2), 'conlang_complete.json', 'application/json');
        showToast('Complete language data exported!', 'success');
    },

    exportWordList() {
        const allWords = window.appState.getState('allWords') || [];
        if (allWords.length === 0) {
            showToast('No vocabulary to export!', 'error');
            return;
        }

        let wordList = `CONLANG WORD LIST\n`;
        wordList += `Generated: ${new Date().toLocaleDateString()}\n`;
        wordList += `Total words: ${allWords.length}\n\n`;
        
        allWords.forEach(word => {
            wordList += `${word.conlang} - ${word.english} (${word.pos})\n`;
        });

        this.downloadFile(wordList, 'conlang_wordlist.txt', 'text/plain');
        showToast('Word list exported!', 'success');
    },

    // Storage functions
    saveToLocalStorage() {
        try {
            const dataToSave = {
                language: window.generator.language,
                allWords: window.appState.getState('allWords') || [],
                saveDate: new Date().toISOString()
            };

            localStorage.setItem('conlang_save', JSON.stringify(dataToSave));
            showToast('Language saved to browser storage!', 'success');
        } catch (error) {
            showToast('Failed to save language data!', 'error');
        }
    },

    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('conlang_save');
            if (!savedData) {
                showToast('No saved language found!', 'error');
                return;
            }

            const data = JSON.parse(savedData);
            
            if (data.language) {
                window.generator.language = data.language;
            }
            if (data.allWords) {
                window.appState.setState('allWords', data.allWords);
            }
            
            if (window.VocabularyModule) {
                window.VocabularyModule.updateDisplay();
            }

            showToast('Language loaded successfully!', 'success');
        } catch (error) {
            showToast('Failed to load language data!', 'error');
        }
    },

    // Import functionality
    importLanguage() {
        const fileInput = document.getElementById('language-file-input');
        if (!fileInput || !fileInput.files.length) {
            showToast('Please select a JSON file to import!', 'error');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Import the data
                if (importData.language) {
                    window.generator.language = importData.language;
                }
                if (importData.allWords) {
                    window.appState.setState('allWords', importData.allWords);
                }
                
                // Refresh displays
                if (window.VocabularyModule) {
                    window.VocabularyModule.updateDisplay();
                }

                showToast(`Language imported successfully! ${importData.allWords?.length || 0} words loaded.`, 'success');
                
            } catch (error) {
                showToast('Invalid JSON file!', 'error');
            }
        };
        reader.readAsText(file);
    },

    // Utility function
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    createIPAFallback(text) {
        if (!text) return '';
        
        return String(text)
            .replace(/ŋ/g, 'ng')
            .replace(/ʃ/g, 'sh')
            .replace(/ʒ/g, 'zh')
            .replace(/θ/g, 'th')
            .replace(/ð/g, 'dh')
            .replace(/ə/g, 'e')
            .replace(/ɛ/g, 'e')
            .replace(/ɔ/g, 'o')
            .replace(/ɪ/g, 'i')
            .replace(/ʊ/g, 'u')
            .replace(/ɸ/g, 'f')
            .replace(/β/g, 'b')
            .replace(/χ/g, 'x')
            .replace(/ɣ/g, 'g')
            .replace(/ʔ/g, "'")
            .replace(/[^\x20-\x7E]/g, '?');
    }
};