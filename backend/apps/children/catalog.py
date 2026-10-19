"""Static content that ships with the app rather than living in the database."""

GUIDES = [
    {
        "id": "samsam",
        "name_ar": "سمسم",
        "name_en": "Samsam",
        "species": "snake",
        "favourite_sound": "س",
        "color": "#5f8a63",
    },
    {
        "id": "zuzu",
        "name_ar": "زوزو",
        "name_en": "Zuzu",
        "species": "bee",
        "favourite_sound": "ز",
        "color": "#d49a3a",
    },
    {
        "id": "shadi",
        "name_ar": "شادي",
        "name_en": "Shadi",
        "species": "owl",
        "favourite_sound": "ش",
        "color": "#8a6a4f",
    },
    {
        "id": "sara",
        "name_ar": "سارة",
        "name_en": "Sara",
        "species": "fox",
        "favourite_sound": "ص",
        "color": "#bb4d34",
    },
]
GUIDE_IDS = [g["id"] for g in GUIDES]

# (id, name, stars needed). Names are i18n keys in frontend child.json -> rewards.names.
STICKERS = [
    ("st1", "first_hiss", 1),
    ("st2", "three_days", 15),
    ("st3", "word_explorer", 30),
    ("st4", "five_days", 50),
    ("st5", "phrase_climber", 90),
    ("st6", "story_teller", 140),
    ("st7", "summit", 200),
    ("st8", "graduate", 300),
]

OUTFITS = [
    ("o1", "explorer_hat", 0),
    ("o2", "scarf", 40),
    ("o3", "backpack", 120),
    ("o4", "crown", 250),
]
