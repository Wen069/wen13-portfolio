#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
toktx_bin="$project_root/tools/ktx/bin/toktx"

if [[ ! -x "$toktx_bin" ]]; then
    echo "toktx is unavailable at $toktx_bin" >&2
    exit 1
fi

intro_files=(
    mouseKeyboardLabel
    gamepadXboxLabel
    gamepadPlaystationLabel
    touchLabel
)

for name in "${intro_files[@]}"; do
    "$toktx_bin" \
        --nowarn --2d --t2 --encode etc1s --qlevel 255 \
        --assign_oetf linear --target_type R --swizzle r001 \
        "$project_root/static/intro/$name.ktx" \
        "$project_root/static/intro/$name.png"
done

career_files=(
    careerHetic
    careerImmersiveGarden
    careerOnlineTeacher
    careerFreelancer
    careerIRLTeacher
    careerUzik
)

for name in "${career_files[@]}"; do
    "$toktx_bin" \
        --nowarn --2d --t2 --encode uastc \
        --assign_oetf srgb --target_type RG \
        "$project_root/static/career/$name.ktx" \
        "$project_root/static/career/$name.png"
done

echo "Encoded Wen13 intro and career KTX textures."
