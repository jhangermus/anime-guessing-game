import json

# Dictionary for Spanish to English translations
genre_translations = {
    # Common genres
    "acción": "action",
    "aventura": "adventure",
    "aventuras": "adventure",
    "comedia": "comedy",
    "drama": "drama",
    "fantasía": "fantasy",
    "terror": "horror",
    "misterio": "mystery",
    "romance": "romance",
    "ciencia ficción": "science fiction",
    "sobrenatural": "supernatural",
    "suspenso": "thriller",
    "deportes": "sports",
    "psicológico": "psychological",
    "música": "music",
    "mecha": "mecha",  # Keep as is
    "histórico": "historical",
    "juegos": "games",
    "ecchi": "ecchi",  # Keep as is
    "demonios": "demons",
    "artes marciales": "martial arts",
    "militar": "military",
    "parodia": "parody",
    "policíaco": "police",
    "post-apocalíptico": "post-apocalyptic",
    "escolar": "school",
    "espacial": "space",
    "vampiros": "vampires",
    "coming of age": "coming of age",  # Keep as is
    "coming-of-age": "coming of age",  # Standardize format
    "cyberpunk": "cyberpunk",  # Keep as is
    "fantasía oscura": "dark fantasy",
    "isekai": "isekai",  # Keep as is
    "mahō shōjo": "magical girl",
    "slice of life": "slice of life",  # Keep as is
    "shōnen": "shounen",  # Keep as is
    "shōjo": "shoujo",  # Keep as is
    "seinen": "seinen",  # Keep as is
    "josei": "josei",  # Keep as is
    "harem": "harem",  # Keep as is
    "harem inverso": "reverse harem",
    "educativo": "educational",
    "infantil": "kids",
    "automóviles": "cars",
    "samurai": "samurai",  # Keep as is
    "superpoderes": "super power",
    "yuri": "yuri",  # Keep as is
    "yaoi": "yaoi",  # Keep as is
    "zombis": "zombies",
    "ficción histórica": "historical fiction",
    "RPG": "RPG",  # Keep as is
    "No finalizado": "Ongoing",  # Special case for "No finalizado"
    "bellas artes": "fine arts",
    "humor absurdo": "absurd humor",
    "comedia negra": "dark comedy",
    "comedia romántica": "romantic comedy",
    "comedia dramática": "comedy drama",
    "comedia fantástica": "fantasy comedy",
    "thriller psicológico": "psychological thriller",
    "videojuego de aventura": "adventure game",
    "videojuego de rol": "role-playing game",
    "humor negro": "dark humor"
}

def normalize_genre(genre):
    """Normalize a genre for comparison"""
    return genre.lower().strip()

def translate_genre(genre):
    """Translate an individual genre"""
    normalized = normalize_genre(genre)
    
    # If it's already in English or should be kept as is, return it
    if normalized in ["action", "adventure", "comedy", "drama", "fantasy", 
                     "horror", "mystery", "romance", "science fiction", 
                     "supernatural", "thriller", "mecha", "ecchi", "isekai", 
                     "slice of life", "shounen", "shoujo", "seinen", "josei", 
                     "harem", "yuri", "yaoi", "rpg", "dark fantasy",
                     "psychological thriller", "coming of age"]:
        return genre
    
    # Look up translation in dictionary
    if normalized in genre_translations:
        translated = genre_translations[normalized]
        # Preserve original capitalization
        if genre[0].isupper():
            translated = translated.capitalize()
        return translated
    
    # If no translation found, keep original
    return genre

# Read the JSON file
with open('data/animedata.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Process each anime
for anime in data:
    if 'genero' in anime and isinstance(anime['genero'], list):
        anime['genero'] = [translate_genre(g) for g in anime['genero']]
    
    # Handle the "No finalizado" case in año_finalizacion
    if 'año_finalizacion' in anime and anime['año_finalizacion'] == "No finalizado":
        anime['año_finalizacion'] = "Ongoing"

# Save the updated JSON file
with open('data/animedata.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("Translation completed.") 