# Rutas que hyperframes necesita. En una Mac con `brew install ffmpeg` y
# `npx hyperframes browser ensure` nada de esto hace falta -- esto es para un
# contenedor sin ffmpeg ni Chrome en el PATH.
HF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export HYPERFRAMES_FFMPEG_PATH="$HF/node_modules/ffmpeg-static/ffmpeg"
export HYPERFRAMES_FFPROBE_PATH="$HF/node_modules/ffprobe-static/bin/linux/x64/ffprobe"
export HYPERFRAMES_BROWSER_PATH="/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"
export HYPERFRAMES_SKIP_SKILLS=1
