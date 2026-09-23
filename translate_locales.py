import json
import os
import time
from deep_translator import GoogleTranslator

lang_map = {
    "as": "as",
    "bn": "bn",
    "brx": "hi",
    "doi": "doi",
    "gu": "gu",
    "hi": "hi",
    "kn": "kn",
    "kok": "gom",
    "ks": "hi",
    "mai": "mai",
    "ml": "ml",
    "mni": "mni-Mtei",
    "mr": "mr",
    "ne": "ne",
    "or": "or",
    "pa": "pa",
    "sa": "sa",
    "sat": "hi",
    "sd": "sd",
    "ta": "ta",
    "te": "te",
    "ur": "ur",
}

def flatten_dict(d, prefix=""):
    items = []
    for k, v in d.items():
        if isinstance(v, dict):
            items.extend(flatten_dict(v, prefix + k + "."))
        elif isinstance(v, str):
            items.append((prefix + k, v))
    return items

def construct_dict(keys, values):
    d = {}
    for k, v in zip(keys, values):
        parts = k.split('.')
        current = d
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        current[parts[-1]] = v
    return d

def strip_prefix(val):
    if val.startswith('[') and ']' in val:
        return val[val.find(']')+1:].strip()
    return val

def main():
    base_dir = r"c:\Users\suhai\Downloads\Uzhavan-Connect-main\src\i18n\locales"
    en_file = os.path.join(base_dir, "en", "translation.json")
    
    with open(en_file, "r", encoding="utf-8") as f:
        en_data = json.load(f)

    en_flat = flatten_dict(en_data)
    en_keys = [item[0] for item in en_flat]
    en_values = [strip_prefix(item[1]) for item in en_flat]
    
    for lang_dir, g_code in lang_map.items():
        target_file = os.path.join(base_dir, lang_dir, "translation.json")
        print(f"Checking {lang_dir}...")
        
        current_data = {}
        if os.path.exists(target_file):
            with open(target_file, "r", encoding="utf-8") as f:
                try:
                    current_data = json.load(f)
                except:
                    pass
        
        current_flat = dict(flatten_dict(current_data))
        
        # Check which keys need translation
        keys_to_translate = []
        strings_to_translate = []
        for i, key in enumerate(en_keys):
            en_val = en_values[i]
            curr_val = strip_prefix(current_flat.get(key, en_val))
            
            # If current value is same as english value, it needs translation
            if curr_val == en_val and en_val.strip() != "":
                keys_to_translate.append(key)
                strings_to_translate.append(en_val)
        
        if not keys_to_translate:
            print(f"Skipping {lang_dir}, all translated.")
            continue
            
        print(f"Translating {len(keys_to_translate)} items for {lang_dir} using code {g_code}...")
        
        translator = GoogleTranslator(source='en', target=g_code)
        
        chunk_size = 30
        translated_map = current_flat.copy()
        
        for i in range(0, len(strings_to_translate), chunk_size):
            chunk = strings_to_translate[i:i+chunk_size]
            chunk_keys = keys_to_translate[i:i+chunk_size]
            
            # Simple retry mechanism
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    res = translator.translate_batch(chunk)
                    for k, r, orig in zip(chunk_keys, res, chunk):
                        translated_map[k] = r if r else orig
                    time.sleep(3) # Wait to avoid rate limits
                    break
                except Exception as e:
                    print(f"Error for batch {i}, attempt {attempt+1}: {e}")
                    time.sleep(10) # wait 10 seconds before retry
            else:
                print(f"Failed completely for batch {i}")
                for k, orig in zip(chunk_keys, chunk):
                    translated_map[k] = orig
        
        # Construct final dict
        final_values = [translated_map.get(k, en_values[idx]) for idx, k in enumerate(en_keys)]
        final_data = construct_dict(en_keys, final_values)
        
        os.makedirs(os.path.dirname(target_file), exist_ok=True)
        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)
            
        print(f"Finished {lang_dir}")

if __name__ == '__main__':
    main()
