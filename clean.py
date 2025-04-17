import json
import re

# Read the original JSON file
with open('data/animedata.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def clean_string(s):
    # Remove [number]​ patterns (including the zero-width space after it)
    s = re.sub(r'\[\d+\]​', '', s)
    # Remove any remaining [number] patterns without zero-width space
    s = re.sub(r'\[\d+\]', '', s)
    # Remove any leading/trailing whitespace
    s = s.strip()
    return s

# Process each anime entry
for anime in data:
    # Clean genres
    if isinstance(anime.get('genero'), list):
        anime['genero'] = [clean_string(g) for g in anime['genero']]
        # Remove empty strings that might result from cleaning
        anime['genero'] = [g for g in anime['genero'] if g]
    
    # Clean other string fields that might contain these patterns
    for field in ['año_debut', 'año_finalizacion', 'estudio']:
        if isinstance(anime.get(field), str):
            anime[field] = clean_string(anime[field])

# Write the cleaned JSON file
with open('data/animedata.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4) 