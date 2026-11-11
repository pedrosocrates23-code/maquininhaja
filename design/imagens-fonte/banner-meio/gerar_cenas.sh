#!/bin/bash
# Cenas do banner do meio do artigo, geradas pelo Codex CLI (image_generation). Sem aparelho, sem texto:
# a foto OFICIAL da maquininha é montada depois por scripts/gerar_banner_meio.py.
cd "$(dirname "$0")"
gen() { # nome, descricao da cena
  cat > "prompt_$1.txt" <<P
Generate one image (use the image generation tool). Landscape 3:2 photograph, realistic editorial style, shallow depth of field, warm natural daylight.
Scene: $2
Composition: leave a flat, empty, well-lit surface in the CENTER of the frame (nothing on it, lower half), because a product photo will be composited there later. Background softly blurred.
Palette: warm wood and white, natural greens from plants, one small accent of vivid green (#00D700) somewhere in the background.
Strict rules: no text, no letters, no numbers, no logos, no brand names, no payment machines or card terminals, no phones, no people, no faces, no hands, no watermarks.
P
  antes=$(ls -t ~/.codex/generated_images 2>/dev/null | head -1)
  timeout 500 codex exec --skip-git-repo-check -s workspace-write - < "prompt_$1.txt" > "log_$1.txt" 2>&1
  novo=$(ls -t ~/.codex/generated_images | head -1)
  f=$(ls -t ~/.codex/generated_images/$novo/*.png 2>/dev/null | head -1)
  if [ -n "$f" ] && [ "$novo" != "$antes" ]; then cp "$f" "cena-$1.png" && echo "$1 ok $f" >> gerar.log; else echo "$1 FALHOU" >> gerar.log; fi
}
gen quiz "the wooden counter of a small neighborhood shop in Brazil, shelves with colorful goods and a hanging plant blurred in the background."
gen calculadora "the desk of a small business owner in Brazil: a light wooden table near a window, an open paper notebook and a pen pushed to the left edge, a coffee cup at the right edge, plants blurred in the background."
gen modelos "the counter of a small boutique in Brazil: a clean light wooden counter, a kraft paper shopping bag at the far left edge, clothes on racks and a plant blurred in the background."
echo fim >> gerar.log
