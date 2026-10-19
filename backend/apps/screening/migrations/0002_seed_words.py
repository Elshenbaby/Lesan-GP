from django.db import migrations

# (id, word, transliteration, meaning_en, sound, position, picture, kind)
WORDS = [
    ("w1", "سمكة", "samaka", "fish", "س", "initial", "fish", "screening"),
    ("w2", "ساعة", "sāʿa", "clock", "س", "initial", "clock", "screening"),
    ("w3", "سيارة", "sayyāra", "car", "س", "initial", "car", "screening"),
    ("w4", "كرسي", "korsi", "chair", "س", "medial", "chair", "screening"),
    ("w5", "بسكوتة", "baskota", "biscuit", "س", "medial", "cookie", "screening"),
    ("w6", "شمس", "shams", "sun", "س", "final", "sun", "screening"),
    ("w7", "فانوس", "fanoos", "lantern", "س", "final", "lantern", "screening"),
    ("w8", "أتوبيس", "otobees", "bus", "س", "final", "bus", "screening"),
    ("w9", "زهرة", "zahra", "flower", "ز", "initial", "flower", "screening"),
    ("w10", "بيتزا", "pizza", "pizza", "ز", "medial", "pizza", "screening"),
    ("w11", "موز", "mooz", "banana", "ز", "final", "banana", "screening"),
    ("p1", "سمكة", "samaka", "fish", "س", "initial", "fish", "practice"),
    ("p2", "ساعة", "sāʿa", "clock", "س", "initial", "clock", "practice"),
    ("p3", "كرسي", "korsi", "chair", "س", "medial", "chair", "practice"),
    ("p4", "شمس", "shams", "sun", "س", "final", "sun", "practice"),
    ("p5", "فانوس", "fanoos", "lantern", "س", "final", "lantern", "practice"),
    ("p6", "زهرة", "zahra", "flower", "ز", "initial", "flower", "practice"),
    ("p7", "بيتزا", "pizza", "pizza", "ز", "medial", "pizza", "practice"),
    ("p8", "موز", "mooz", "banana", "ز", "final", "banana", "practice"),
    ("syl-0", "سا", "sa", "syllable", "س", "initial", "wind", "syllable"),
    ("syl-1", "سو", "su", "syllable", "س", "initial", "wind", "syllable"),
    ("syl-2", "سي", "si", "syllable", "س", "initial", "wind", "syllable"),
    ("syl-3", "اس", "as", "syllable", "س", "final", "wind", "syllable"),
    ("syl-z0", "زا", "za", "syllable", "ز", "initial", "wind", "syllable"),
    ("syl-z1", "زو", "zu", "syllable", "ز", "initial", "wind", "syllable"),
    ("syl-z2", "زي", "zi", "syllable", "ز", "initial", "wind", "syllable"),
    ("iso-s", "سسسس", "ssss", "snake sound", "س", "initial", "wind", "isolation"),
    ("iso-z", "زززز", "zzzz", "bee sound", "ز", "initial", "wind", "isolation"),
]


def seed(apps, schema_editor):
    Word = apps.get_model("screening", "Word")
    for order, (wid, word, translit, meaning, sound, position, picture, kind) in enumerate(WORDS):
        Word.objects.update_or_create(
            id=wid,
            defaults=dict(
                word=word, transliteration=translit, meaning_en=meaning, target_sound=sound, position=position,
                picture=picture, kind=kind, order=order,
            ),
        )


def unseed(apps, schema_editor):
    apps.get_model("screening", "Word").objects.filter(id__in=[w[0] for w in WORDS]).delete()


class Migration(migrations.Migration):
    dependencies = [("screening", "0001_initial")]

    operations = [migrations.RunPython(seed, unseed)]
