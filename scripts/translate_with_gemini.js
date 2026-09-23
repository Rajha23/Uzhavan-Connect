import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const ai = new GoogleGenAI({}); // SDK picks up GEMINI_API_KEY from environment

const langMap = {
    "as": "Assamese",
    "bn": "Bengali",
    "hi": "Hindi",
    "gu": "Gujarati",
    "kn": "Kannada",
    "ml": "Malayalam",
    "mr": "Marathi",
    "or": "Odia",
    "pa": "Punjabi",
    "ta": "Tamil",
    "te": "Telugu",
    "ur": "Urdu"
};

function flattenDict(d, prefix = "") {
    let items = [];
    for (const [k, v] of Object.entries(d)) {
        if (typeof v === 'object' && v !== null) {
            items = items.concat(flattenDict(v, prefix + k + "."));
        } else if (typeof v === 'string') {
            items.push([prefix + k, v]);
        }
    }
    return items;
}

function constructDict(keys, values) {
    const d = {};
    for (let i = 0; i < keys.length; i++) {
        const parts = keys[i].split('.');
        let current = d;
        for (let j = 0; j < parts.length - 1; j++) {
            if (!current[parts[j]]) current[parts[j]] = {};
            current = current[parts[j]];
        }
        current[parts[parts.length - 1]] = values[i];
    }
    return d;
}

function stripPrefix(val) {
    if (val.startsWith('[') && val.includes(']')) {
        return val.substring(val.indexOf(']') + 1).trim();
    }
    return val;
}

async function translateBatch(items, langName) {
    const textToTranslate = items.map(([, val]) => stripPrefix(val));
    const prompt = `Translate the following array of english strings into ${langName}. 
Maintain the exact same array structure, order, and length in your response. 
Respond ONLY with a valid JSON array of strings containing the translations, nothing else. No markdown formatting.
Do NOT translate variables inside curly braces like {{count}} or {name}.
Strings:
${JSON.stringify(textToTranslate, null, 2)}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
            }
        });
        
        let responseText = response.text;
        // Clean up markdown code blocks if any
        responseText = responseText.replace(/^```json/m, '').replace(/^```/m, '').trim();
        const translatedArray = JSON.parse(responseText);
        
        if (translatedArray.length !== items.length) {
            console.error(`Length mismatch! Expected ${items.length}, got ${translatedArray.length}`);
            return textToTranslate; // Fallback
        }
        return translatedArray;
    } catch (e) {
        console.error("Error during translation:", e.message);
        return textToTranslate; // Fallback to english on error
    }
}

async function main() {
    const targetLangCode = process.argv[2];
    if (!targetLangCode || !langMap[targetLangCode]) {
        console.error("Please provide a valid target language code, e.g., 'ta'");
        process.exit(1);
    }
    
    const langName = langMap[targetLangCode];
    console.log(`Starting translation for ${langName} (${targetLangCode})...`);

    const baseDir = path.resolve(__dirname, '../src/i18n/locales');
    const enFile = path.join(baseDir, 'en', 'translation.json');
    const targetFile = path.join(baseDir, targetLangCode, 'translation.json');
    
    const enData = JSON.parse(await fs.readFile(enFile, 'utf8'));
    let currentData = {};
    try {
        currentData = JSON.parse(await fs.readFile(targetFile, 'utf8'));
    } catch (e) {
        console.log("No existing file found or error reading, starting fresh.");
    }

    const enFlat = flattenDict(enData);
    const currentFlat = flattenDict(currentData);
    const currentFlatMap = Object.fromEntries(currentFlat);
    
    const itemsToTranslate = [];
    const enKeys = enFlat.map(i => i[0]);
    const enValues = enFlat.map(i => i[1]);
    
    // Collect items that need translation (where current has a prefix or matches english exactly)
    for (let i = 0; i < enKeys.length; i++) {
        const key = enKeys[i];
        const enVal = enValues[i];
        const currVal = currentFlatMap[key] || enVal;
        
        if (currVal.startsWith('[') || currVal === enVal) {
            if (enVal.trim() !== "") {
                itemsToTranslate.push([key, enVal]);
            }
        }
    }

    if (itemsToTranslate.length === 0) {
        console.log("Nothing to translate.");
        return;
    }

    console.log(`Found ${itemsToTranslate.length} items to translate.`);
    
    const chunkSize = 50;
    const finalFlatMap = { ...currentFlatMap };
    
    for (let i = 0; i < itemsToTranslate.length; i += chunkSize) {
        console.log(`Translating batch ${Math.floor(i/chunkSize) + 1} of ${Math.ceil(itemsToTranslate.length/chunkSize)}...`);
        const chunk = itemsToTranslate.slice(i, i + chunkSize);
        
        const translatedChunk = await translateBatch(chunk, langName);
        
        for (let j = 0; j < chunk.length; j++) {
            const key = chunk[j][0];
            finalFlatMap[key] = translatedChunk[j];
        }
        
        // Wait briefly to avoid hitting rate limits too fast
        await new Promise(r => setTimeout(r, 2000));
    }
    
    // Construct final dict in the same order as english keys
    const finalValues = enKeys.map(k => finalFlatMap[k] || enValues[enKeys.indexOf(k)]);
    const finalData = constructDict(enKeys, finalValues);
    
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, JSON.stringify(finalData, null, 2), 'utf8');
    
    console.log(`Translation complete for ${langName}!`);
}

main().catch(console.error);
