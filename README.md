# 🇮🇳 Indian Lyrics Romanizer

A Spicetify extension that romanizes Indian script lyrics into phonetic English, right inside Spotify's lyrics panel.

## Why I built this

India has so many languages and scripts. A lot of us love songs from other regions, like a Hindi speaker vibing to a Tamil track, but can't read the lyrics. There's also a huge diaspora that grew up speaking their mother tongue at home but never learned to read the script, plus fans everywhere who just want to sing along to AR Rahman or Arijit Singh.

Spotify gives you the lyrics, but if you can't read the script, that doesn't help much. This extension converts all those different Indian scripts into standard English phonetics in real time. As long as you can read English, you can sing along to any Indian song, no matter what script it's written in.

### Who this is for
- You speak the language but never learned the script.
- You're part of the diaspora, grew up speaking your mother tongue at home, but can't read it.
- You love Indian music (AR Rahman, Arijit Singh, etc.) and just want to sing along.
- You're learning an Indian language and want some phonetic reading practice.
- You know Hindi but can't read regional scripts like Tamil, Telugu, or Bengali.

## Supported Scripts

| Language   | Script     | Unicode Range   |
|------------|------------|-----------------|
| Hindi      | Devanagari | U+0900–U+097F   |
| Punjabi    | Gurmukhi   | U+0A00–U+0A7F   |
| Bengali    | Bengali    | U+0980–U+09FF   |
| Gujarati   | Gujarati   | U+0A80–U+0AFF   |
| Odia       | Odia       | U+0B00–U+0B7F   |
| Tamil      | Tamil      | U+0B80–U+0BFF   |
| Telugu     | Telugu     | U+0C00–U+0C7F   |
| Kannada    | Kannada    | U+0C80–U+0CFF   |
| Malayalam  | Malayalam  | U+0D00–U+0D7F   |
| Urdu       | Arabic/Nastaliq | U+0600–U+06FF |

## Features

- Topbar button with the अ symbol: green when romanization is on, dim grey when it's off
- `Alt + R` toggles romanization on/off from anywhere in Spotify, no need to open the panel
- Copy Lyrics button: grabs the current song's lyrics to your clipboard in one click
- Dropdown panel with a master switch, per-script checkboxes, and auto-detect (figures out the script for you instead of you picking it)
- Settings stick around between sessions via `localStorage`
- Turn it off and you get the original script back exactly as it was

## Preview

**Hindi, before and after**

![Hindi before and after](assets/final_hindi.png)

**Tamil, before and after**

![Tamil Comparison](assets/final_tamil.png)

## Installation

1. Make sure [Spicetify](https://spicetify.app/) is installed.
2. Copy `indian-romanizer.js` to your Spicetify extensions folder:
   ```
   %appdata%\spicetify\Extensions\
   ```
3. Run:
   ```bash
   spicetify config extensions indian-romanizer.js
   spicetify apply
   ```

## Usage

- Press `Alt + R` anytime in Spotify to toggle romanization on or off.
- Click the अ button in the topbar to open the settings panel.
- Flip the master switch on or off.
- Use Copy Lyrics to grab the current lyrics to your clipboard.
- Turn on auto-detect, or manually pick which scripts you want romanized.
- Lyrics render phonetically in real time as the song plays.
- Turn it off and the original script comes right back.

## License

MIT
