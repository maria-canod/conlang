// Tab Management System
class TabManager {
    constructor() {
        this.tabs = [
            { id: 'home', name: '🏠 Home', file: 'templates/home.html' },
            { id: 'phonology', name: '🔤 Phonology', file: 'templates/phonology.html' },
            { id: 'grammar', name: '📖 Grammar', file: 'templates/grammar.html' },
            { id: 'morphology', name: '🔧 Morphology', file: 'templates/morphology.html' },
            { id: 'generator', name: '⚡ Generator', file: 'templates/generator.html' },
            { id: 'vocabulary', name: '📚 Vocabulary', file: 'templates/vocabulary.html' },
            { id: 'corpus', name: '📝 Corpus', file: 'templates/corpus.html' },
            { id: 'cultural', name: '🏛️ Cultural', file: 'templates/cultural.html' },
            { id: 'ai-assistant', name: '🤖 AI Assistant', file: 'templates/ai-assistant.html' },
            { id: 'overview', name: '📊 Overview', file: 'templates/overview.html' },
            { id: 'export', name: '📤 Export', file: 'templates/export.html' }
        ];
        this.currentTab = 'home';
        this.init();
    }

    init() {
        this.renderTabs();
        // Load home tab by default
        this.loadTab('home');
    }

    renderTabs() {
        const navTabs = document.querySelector('.nav-tabs');
        if (!navTabs) {
            console.error('Nav tabs container not found');
            return;
        }

        navTabs.innerHTML = this.tabs.map(tab => 
            `<button class="nav-tab ${tab.id === this.currentTab ? 'active' : ''}" 
                     onclick="tabManager.switchTab('${tab.id}')">${tab.name}</button>`
        ).join('');
    }

    async switchTab(tabId) {
        if (this.currentTab === tabId) return;

        // Update active state in navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const clickedTab = Array.from(document.querySelectorAll('.nav-tab')).find(tab => 
            tab.onclick && tab.onclick.toString().includes(`'${tabId}'`)
        );
        if (clickedTab) {
            clickedTab.classList.add('active');
        }

        this.currentTab = tabId;
        await this.loadTab(tabId);
    }

    async loadTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) {
            console.error(`Tab ${tabId} not found`);
            return;
        }

        const contentContainer = document.getElementById('tab-content-container');
        if (!contentContainer) {
            console.error('Tab content container not found');
            return;
        }

        try {
            // Show loading state
            contentContainer.innerHTML = '<div style="text-align: center; padding: 50px;"><div class="loading"></div><p>Loading...</p></div>';
            
            const response = await fetch(tab.file);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${tab.file}: ${response.status}`);
            }
            
            const html = await response.text();
            contentContainer.innerHTML = html;
            
            // Initialize tab-specific functionality
            this.initTabFunctionality(tabId);
            
        } catch (error) {
            console.error(`Failed to load tab ${tabId}:`, error);
            contentContainer.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #dc3545;">
                    <h3>Error Loading Tab</h3>
                    <p>Could not load the ${tab.name} tab.</p>
                    <p><small>Error: ${error.message}</small></p>
                    <button class="btn" onclick="tabManager.switchTab('home')">← Back to Home</button>
                </div>
            `;
        }
    }

    initTabFunctionality(tabId) {
        // This method will be expanded when we modularize the JavaScript
        console.log(`Initializing tab functionality for: ${tabId}`);
        
        // Call any tab-specific initialization functions
        switch (tabId) {
            case 'phonology':
                if (window.PhonologyModule) {
                    console.log('Initializing PhonologyModule');
                    window.PhonologyModule.init();
                } else {
                    console.error('PhonologyModule not found');
                }
                break;
            case 'generator':
                if (window.GeneratorModule) {
                    console.log('Initializing GeneratorModule');
                    window.GeneratorModule.init();
                } else {
                    console.error('GeneratorModule not found');
                }
                break;
            case 'vocabulary':
                if (window.VocabularyModule) {
                    console.log('Initializing VocabularyModule');
                    window.VocabularyModule.init();
                } else {
                    console.error('VocabularyModule not found');
                }
                break;
            case 'grammar':
                if (window.GrammarModule) {
                    console.log('Initializing GrammarModule');
                    window.GrammarModule.init();
                } else {
                    console.error('GrammarModule not found');
                }
                break;
            case 'morphology':
                if (window.MorphologyModule) {
                    console.log('Initializing MorphologyModule');
                    window.MorphologyModule.init();
                } else {
                    console.error('MorphologyModule not found');
                }
                break;
            case 'corpus':
                if (window.CorpusModule) {
                    console.log('Initializing CorpusModule');
                    window.CorpusModule.init();
                } else {
                    console.error('CorpusModule not found');
                }
                break;
            case 'cultural':
                if (window.CulturalModule) {
                    console.log('Initializing CulturalModule');
                    window.CulturalModule.init();
                } else {
                    console.error('CulturalModule not found');
                }
                break;
            case 'ai-assistant':
                if (window.AIAssistant) {
                    console.log('Initializing AI Assistant');
                    window.AIAssistant.init();
                } else {
                    console.error('AIAssistant not found');
                }
                break;
            case 'overview':
                if (window.OverviewModule) {
                    console.log('Initializing OverviewModule');
                    window.OverviewModule.init();
                } else {
                    console.error('OverviewModule not found');
                }
                break;
            case 'export':
                if (window.ExportModule) {
                    console.log('Initializing ExportModule');
                    window.ExportModule.init();
                } else {
                    console.error('ExportModule not found');
                }
                break;
            case 'home':
                // Home tab doesn't need special initialization
                if (window.ActivityModule) {
                    window.ActivityModule.updateRecentActivityDisplay();
                }
                break;
            default:
                console.log(`No specific initialization for tab: ${tabId}`);
        }
    }
}

// Initialize the tab manager when the page loads
let tabManager;
document.addEventListener('DOMContentLoaded', function() {
    tabManager = new TabManager();
});

// Global function for backward compatibility
function switchTab(tabId) {
    if (tabManager) {
        tabManager.switchTab(tabId);
    } else {
        console.error('TabManager not initialized');
    }
}