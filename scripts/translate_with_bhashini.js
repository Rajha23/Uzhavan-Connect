import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const USER_ID = process.env.BHASHINI_USER_ID;
const API_KEY = process.env.BHASHINI_API_KEY;
const PIPELINE_ID = process.env.BHASHINI_PIPELINE_ID;

if (!USER_ID || !API_KEY) {
    console.error("Missing Bhashini credentials in .env");
    process.exit(1);
}

const langMap = {
    "as": "as",
    "bn": "bn",
    "hi": "hi",
    "gu": "gu",
    "kn": "kn",
    "ml": "ml",
    "mr": "mr",
    "or": "or",
    "pa": "pa",
    "ta": "ta",
    "te": "te",
    "ur": "ur"
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

async function translateBatch(items, targetLangCode) {
    const texts = items.map(([, val]) => stripPrefix(val));
    const translatedArray = [];

    // Bhashini prefers single text or batch of few. We will send them one by one or small batches.
    for (const text of texts) {
        if (text.trim() === '') {
            translatedArray.push(text);
            continue;
        }

        const payload = {
            pipelineTasks: [
                {
                    taskType: "translation",
                    config: {
                        language: {
                            sourceLanguage: "en",
                            targetLanguage: targetLangCode
                        }
                    }
                }
            ],
            inputData: {
                input: [{ source: text }]
            }
        };

        try {
            const response = await fetch("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "userID": USER_ID,
                    "ulcaApiKey": API_KEY,
                    "Authorization": API_KEY
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error(`Bhashini API error ${response.status} for text: ${text}`);
                translatedArray.push(text); // Fallback
                continue;
            }

            const data = await response.json();
            const translatedContent = data?.pipelineResponse?.[0]?.output?.[0]?.target || text;
            translatedArray.push(translatedContent);

        } catch (e) {
            console.error("Error during translation:", e.message);
            translatedArray.push(text);
        }
    }
    return translatedArray;
}

async function main() {
    const targetLangCode = process.argv[2];
    if (!targetLangCode || !langMap[targetLangCode]) {
        console.error("Please provide a valid target language code, e.g., 'ta'");
        process.exit(1);
    }
    
    console.log(`Starting translation for ${targetLangCode}...`);

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
    
    const chunkSize = 10;
    const finalFlatMap = { ...currentFlatMap };
    
    for (let i = 0; i < itemsToTranslate.length; i += chunkSize) {
        console.log(`Translating batch ${Math.floor(i/chunkSize) + 1} of ${Math.ceil(itemsToTranslate.length/chunkSize)}...`);
        const chunk = itemsToTranslate.slice(i, i + chunkSize);
        
        const translatedChunk = await translateBatch(chunk, targetLangCode);
        
        for (let j = 0; j < chunk.length; j++) {
            const key = chunk[j][0];
            finalFlatMap[key] = translatedChunk[j];
        }
    }
    
    // Construct final dict in the same order as english keys
    const finalValues = enKeys.map(k => finalFlatMap[k] || enValues[enKeys.indexOf(k)]);
    const finalData = constructDict(enKeys, finalValues);
    
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, JSON.stringify(finalData, null, 2), 'utf8');
    
    console.log(`Translation complete for ${targetLangCode}!`);
}

main().catch(console.error);
