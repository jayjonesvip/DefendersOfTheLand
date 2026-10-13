"""Export published chapter scripts; optionally narrate through OpenAI TTS."""
import argparse, json, os, pathlib, re, subprocess, tempfile, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--book', default='origins')
p.add_argument('--generate', action='store_true', help='Call the paid OpenAI API')
p.add_argument('--audition', action='store_true', help='Generate only the first short passage')
p.add_argument('--voice', default='marin')
p.add_argument('--chapter', type=int)
p.add_argument('--model', default='gpt-4o-mini-tts')
a = p.parse_args()
if not re.fullmatch(r'[a-z0-9-]+', a.book): p.error('Invalid book ID')
bookdir = ROOT / 'content/books' / a.book
book = json.loads((bookdir / 'book.json').read_text())
if a.book == 'origins':
    configs = [json.loads(f.read_text()) for f in (ROOT / 'print').glob('*.json')
               if f.name == 'sample.json' or re.fullmatch(r'chapter\d+\.json', f.name)]
    configs.sort(key=lambda c: c['displayChapterNumber'])
else:
    configs = []
    for name in book['chapters']:
        ch = json.loads((bookdir / name).read_text())
        if ch.get('available'): configs.append({'sourceChapter': name, 'displayChapterNumber': ch['number']})
assert [c['displayChapterNumber'] for c in configs] == list(range(1, len(configs)+1))
out = ROOT / 'output/audiobook' / a.book
out.mkdir(parents=True, exist_ok=True)
chapters = []
for config in configs:
    ch = json.loads((bookdir / config['sourceChapter']).read_text())
    paragraphs = []
    for b in ch['blocks']:
        if b.get('dialogue'): paragraphs.append('“' + b['dialogue'] + '”')
        if b.get('text'): paragraphs.append(b['text'])
    if ch.get('ending'): paragraphs.append(ch['ending'])
    n = config['displayChapterNumber']
    text = f"Chapter {n}. {ch['title']}.\n\n" + '\n\n'.join(paragraphs)
    (out / f'{n:02d}-chapter.txt').write_text(text+'\n')
    chapters.append((n, text, ch['title']))
print(f'Prepared {len(chapters)} chapter scripts in {out}')
if not a.generate: raise SystemExit(0)
key = os.environ.get('OPENAI_API_KEY')
if not key: p.error('Set OPENAI_API_KEY in your environment; do not put it in source files or chat.')
selected = [c for c in chapters if a.chapter is None or c[0] == a.chapter]
if not selected: p.error('Chapter not found')
if a.audition: selected = selected[:1]
instructions = ('Narrate this illustrated superhero adventure in clear natural English, with warm cinematic energy, '
                'distinct but subtle character voices, measured pacing and suspense. Preserve every word. '
                'Read dialogue expressively without exaggerated cartoon voices. Do not add commentary.')
# Keep requests small enough for the model input limit, split at prose boundaries.
def chunks(text, limit=2400):
    current = ''
    for paragraph in text.split('\n\n'):
        if len(paragraph) > limit:
            raise ValueError('A paragraph exceeds the chunk limit; split it manually before narration.')
        if current and len(current) + len(paragraph) + 2 > limit:
            yield current
            current = ''
        current += ('\n\n' if current else '') + paragraph
    if current: yield current
for n, text, title in selected:
    target = out / (f'audition-{a.voice}.mp3' if a.audition else f'{n:02d}-chapter-{a.voice}.mp3')
    if target.exists():
        print(f'Skipping existing {target.name}; remove it explicitly to regenerate.')
        continue
    if a.audition: text = next(chunks(text, 900))
    with tempfile.TemporaryDirectory(dir=out) as temp:
        parts = []
        for i, fragment in enumerate(chunks(text)):
            payload = json.dumps({'model': a.model, 'voice': a.voice, 'input': fragment,
                                  'instructions': instructions, 'response_format': 'mp3'}).encode()
            request = urllib.request.Request('https://api.openai.com/v1/audio/speech', data=payload,
                      headers={'Authorization': 'Bearer '+key, 'Content-Type': 'application/json'})
            part = pathlib.Path(temp) / f'part-{i:03d}.mp3'
            with urllib.request.urlopen(request, timeout=180) as response:
                data = response.read()
            if not data: raise RuntimeError('Empty audio response')
            part.write_bytes(data); parts.append(part)
        listing = pathlib.Path(temp) / 'parts.txt'
        listing.write_text('\n'.join(f"file '{part.name}'" for part in parts)+'\n')
        staged = pathlib.Path(temp) / 'chapter.mp3'
        subprocess.run(['ffmpeg','-v','error','-f','concat','-safe','1','-i',str(listing),
                        '-map_metadata','-1','-c:a','libmp3lame','-b:a','192k',str(staged)],check=True)
        subprocess.run(['ffmpeg','-v','error','-i',str(staged),'-f','null','-'],check=True)
        staged.replace(target)
    print(f'Generated {target.name}: {title}')
