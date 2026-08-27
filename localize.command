#!/usr/bin/env bash
# Double-click this on macOS to download all media locally
# (and slice scroll frames if ffmpeg is installed).
cd "$(dirname "$0")"
bash ./localize.sh
echo ""
read -n 1 -s -r -p "Press any key to close…"
echo ""
