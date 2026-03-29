# Tour Life: International Dates — Audio Manifest

## How to Source / Generate These Tracks

All tracks should be exported as `.ogg` (primary) and `.mp3` (fallback).
Target file size: < 2MB per music track, < 100KB per SFX.

---

## Music Tracks (5 required)

| Filename | City | Genre | BPM | Length | Source Suggestions |
|----------|------|-------|-----|--------|--------------------|
| `seattle_punk.ogg` | Seattle | Grunge/Punk | 120 | 90s loop | Uppbeat.io, Pixabay, or generate in Suno/Udio with prompt below |
| `newyork_hiphop.ogg` | New York | Hip-Hop/R&B | 90 | 90s loop | Uppbeat.io, Pixabay |
| `london_indie.ogg` | London | Acoustic Indie | 105 | 90s loop | Pixabay, Free Music Archive |
| `tokyo_edm.ogg` | Tokyo | EDM/Hyperpop | 135 | 90s loop | Uppbeat.io, generate in Suno |
| `la_rock.ogg` | Los Angeles | Stadium Rock | 126 | 90s loop | Pixabay, Free Music Archive |
| `bus_ambience.ogg` | Tour Bus | Ambient | — | 30s loop | Freesound.org "highway road noise" |

### Suno/Udio Generation Prompts

**seattle_punk.ogg:**
> "Raw grunge punk, distorted guitars, driving drums, 120 BPM, no vocals, 90 second loop, Seattle 1990s sound"

**newyork_hiphop.ogg:**
> "Underground hip-hop instrumental, boom bap drums, bass, 90 BPM, no vocals, 90 second seamless loop"

**london_indie.ogg:**
> "Acoustic indie folk, fingerpicked guitar, light percussion, warm tone, 105 BPM, no vocals, 90 second loop"

**tokyo_edm.ogg:**
> "Hyperpop EDM, heavy 4-on-the-floor kick, synth leads, 135 BPM, no vocals, 90 second seamless loop"

**la_rock.ogg:**
> "Anthemic stadium rock, power chords, soaring lead guitar, 126 BPM, no vocals, 90 second loop"

---

## Sound Effects (11 required)

| Filename | Description | Source |
|----------|-------------|--------|
| `crowd_cheer.ogg` | Stadium crowd erupting (3s) | Freesound.org: search "stadium cheer" |
| `crowd_boo.ogg` | Crowd booing (2s) | Freesound.org: search "crowd boo" |
| `crowd_divebar.ogg` | Indie bar chatter ambience loop (10s) | Freesound.org: search "bar chatter" |
| `ui_click.ogg` | Crisp UI click (0.1s) | Generate: 440Hz sine, 100ms fade |
| `dialogue_blip.ogg` | Text scroll blip (0.05s) | Generate: 880Hz sine, 50ms fade |
| `note_perfect.ogg` | Perfect hit chime (0.3s) | Generate: C5 bell tone, quick decay |
| `note_good.ogg` | Good hit (0.2s) | Generate: G4 tone, quick decay |
| `note_miss.ogg` | Miss/error dissonant hit (0.3s) | Generate: dissonant buzz, 300ms |
| `power_up.ogg` | Power-up activated (0.5s) | Freesound.org: search "power up arcade" |
| `scene_transition.ogg` | Whoosh between scenes (0.5s) | Freesound.org: search "whoosh transition" |
| `money_earn.ogg` | Cash register / coins (0.4s) | Freesound.org: search "coin collect" |

---

## Generating SFX Programmatically (Python fallback)

Run `generate_sfx.py` (included in `/src/utils/`) to create placeholder beep tones
for all SFX files so the game runs without real audio assets during development.

```bash
python src/utils/generate_sfx.py
```

This creates silent/beep placeholders so Phaser doesn't throw asset load errors.
Replace with real audio before final release.
