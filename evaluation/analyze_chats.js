const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const chatsDir = 'thesis/chats';
const outputDir = 'evaluation';
const branches = JSON.parse(fs.readFileSync('evaluation/branches.json', 'utf8'));

// Mapping from filename to branch (approximate)
function mapFileToBranch(filename) {
    const namePart = filename.replace('.docx', '').toLowerCase().replace(/_/g, '-');
    // Manual overrides
    if (filename.includes('Cihad')) return 'goek-cihad-vibe';
    if (filename.includes('Janni')) return 'tselekoglou-ioannis-vibe';
    if (filename.includes('Jochen')) return 'Theuerkauf-Jochen-vibe';

    // Try to find matching branch
    const match = branches.find(b => {
        const parts = namePart.split('-');
        return parts.every(p => b.toLowerCase().includes(p));
    });
    return match || 'unknown';
}

const tasks = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];
const taskKeywords = {
    'T1': ['task 1', 'aufgabe 1', 'persistent', 'datenbank', 'db', 'sqlite', 'speichern'],
    'T2': ['task 2', 'aufgabe 2', 'user', 'auth', 'login', 'registrierung', 'account'],
    'T3': ['task 3', 'aufgabe 3', 'category', 'kategorie', 'farbe', 'hex'],
    'T4': ['task 4', 'aufgabe 4', 'attachment', 'datei', 'upload', 'bild'],
    'T5': ['task 5', 'aufgabe 5', 'calendar', 'kalender', 'multi-day', 'view'],
    'T6': ['task 6', 'aufgabe 6', 'email', 'verifikation', 'verify'],
    'T7': ['task 7', 'aufgabe 7', 'performance', 'lazy', 'optimierung'],
    'T8': ['task 8', 'aufgabe 8', 'ics', 'export', 'calendar export']
};

async function parseChats() {
    const files = fs.readdirSync(chatsDir).filter(f => f.endsWith('.docx'));
    const attempts = {};
    const promptExamples = {};

    for (const file of files) {
        const branch = mapFileToBranch(file);
        console.log(`Processing ${file} -> ${branch}`);
        
        const buffer = fs.readFileSync(path.join(chatsDir, file));
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;
        
        attempts[branch] = {};
        
        // Analyze Attempts
        tasks.forEach(task => {
            const keywords = taskKeywords[task];
            const regex = new RegExp(keywords.join('|'), 'i');
            const explicitMention = text.toLowerCase().includes(task.toLowerCase()) || 
                                  text.toLowerCase().includes(`aufgabe ${task.replace('T', '')}`);
            
            const keywordHit = regex.test(text);
            
            let confidence = 'none';
            if (explicitMention && keywordHit) confidence = 'high';
            else if (explicitMention) confidence = 'medium';
            else if (keywordHit) confidence = 'low';
            
            attempts[branch][task] = {
                attempted: confidence !== 'none',
                confidence: confidence
            };
        });

        // Extract Prompts (Simple heuristic: paragraphs starting with "User" or "Prompt")
        // This is hard with raw text, but we'll try to find blocks.
        // We'll look for "Task X" context and grab surrounding text.
        
        tasks.slice(0, 5).forEach(task => {
            if (!promptExamples[task]) promptExamples[task] = [];
            
            const taskRegex = new RegExp(`(task ${task.replace('T', '')}|aufgabe ${task.replace('T', '')})`, 'i');
            const match = text.match(taskRegex);
            if (match) {
                const index = match.index;
                const snippet = text.substring(Math.max(0, index - 200), Math.min(text.length, index + 500));
                promptExamples[task].push({
                    branch,
                    snippet: snippet.replace(/\n/g, ' ').trim()
                });
            }
        });
    }

    fs.writeFileSync(path.join(outputDir, 'chat_task_attempts.json'), JSON.stringify(attempts, null, 2));
    
    // Generate Prompt Markdown
    let md = '# Prompt Examples\n\n';
    for (const task of Object.keys(promptExamples)) {
        md += `## ${task}\n`;
        promptExamples[task].slice(0, 6).forEach(p => {
            md += `**Branch:** ${p.branch}\n\n> ...${p.snippet}...\n\n`;
        });
    }
    fs.writeFileSync(path.join(outputDir, 'prompt_examples_by_task.md'), md);
}

parseChats();
