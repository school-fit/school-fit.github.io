"""
Update index.html:
 1. renderExercisePhaseRow: use .png as primary src (AI silhouettes)
 2. pvImgFallback: fallback to SVG if PNG fails
 3. Update CSS aspect ratio to match PNG (16:9 = 1792/1024)
"""
import re

PATCH = {
    # Use PNG first
    "'/phase-' + n + '.svg'));":
    "'/phase-' + n + '.png'));",

    # Fallback: try SVG variants if PNG 404s
    """  var chain = [
    exerciseAssetUrl('pictures/exercises/' + slug + '/phase-' + n + '.svg'),
    exerciseAssetUrl('pictures/exercises/' + slug + '/m/phase-' + n + '.svg')
  ];""":
    """  var chain = [
    exerciseAssetUrl('pictures/exercises/' + slug + '/' + (img.dataset.td||'m') + '/phase-' + n + '.svg'),
    exerciseAssetUrl('pictures/exercises/' + slug + '/m/phase-' + n + '.svg')
  ];""",

    # Update aspect ratio for PNG (landscape ~16:9)
    'aspect-ratio:300/220;':
    'aspect-ratio:16/9;',
}

with open('../index.html', 'r', encoding='utf-8') as f:
    html = f.read()

for old, new in PATCH.items():
    if old in html:
        html = html.replace(old, new, 1)
        print('Patched:', old[:60])
    else:
        print('NOT FOUND:', old[:60])

with open('../index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Done.')
