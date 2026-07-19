#!/bin/zsh

set -euo pipefail

project_root="${0:A:h:h}"
toktx_bin="$project_root/tools/ktx/bin/toktx"
image_dir="$project_root/static/projects/images"

for input_file in "$image_dir"/wen13-*.png; do
    output_file="${input_file%.png}.ktx"
    "$toktx_bin" --nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf srgb --target_type RGB "$output_file" "$input_file"
done

echo "Encoded Wen13 project PNG files to KTX2."
