## Audio

### Convert flac/wav/m4a to mp3

    for f in *.flac; do ffmpeg -i "$f" -ab 320k -map_metadata 0 -id3v2_version 3 "${f%.flac}.mp3"; done
    for f in *.wav; do ffmpeg -i "$f" -acodec libmp3lame -ab 320k "${f%.wav}.mp3"; done
    for f in *.m4a; do ffmpeg -i "$f" -acodec libmp3lame -ab 320k "${f%.m4a}.mp3"; done

## Video

### Convert mov to webm/mp4

    ffmpeg -i file.mov -c:v libvpx -crf 10 -b:v 2M -r 24 -c:a libvorbis file.webm
    ffmpeg -i file.mov -f mp4 -c:v libx264 -b:v 2M -r 24 -c:a libfdk_aac -b:a 128k file.mp4

### Convert mp4 to gif and cut

    ffmpeg -i file.mp4 -ss 30 -t 3 -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 file.gif

### Cut video (ss=start, t=length)

    ffmpeg -i video-file.uncut -ss 00:00:05.0 -c copy -t 00:05:57.0 video-file.cut

### Shrink to half/third/quarter size

    ffmpeg -i input.mkv -vf "scale=trunc(iw/4)*2:trunc(ih/4)*2" -c:v libx265 -crf 28 output.mkv
    ffmpeg -i input.mkv -vf "scale=trunc(iw/6)*2:trunc(ih/6)*2" -c:v libx265 -crf 28 output.mkv
    ffmpeg -i input.mkv -vf "scale=trunc(iw/8)*2:trunc(ih/8)*2" -c:v libx265 -crf 28 output.mkv
