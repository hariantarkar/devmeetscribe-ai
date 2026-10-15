# Audio upload setup (Whisper)

Audio is turned into text by a local `whisper-server` (whisper.cpp). Nothing leaves your computer.
You do this once. Text transcripts work without it.

## 1. Download the server
Download and extract (Windows, CPU build):
https://github.com/ggml-org/whisper.cpp/releases/download/v1.9.2/whisper-bin-x64.zip

Extract it to `C:\whisper`, so this file exists: `C:\whisper\Release\whisper-server.exe`

## 2. Download a model
In PowerShell:

```powershell
mkdir C:\whisper\models
curl.exe -L -o C:\whisper\models\ggml-base.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin
```

`ggml-base.bin` (142 MB) is a good balance and understands many languages.
For better accuracy on Hindi or Marathi, use `ggml-small.bin` (466 MB, slower).
Do not use the `.en` models if you need other languages.

## 3. Start it (keep the window open)

```powershell
cd C:\whisper\Release
.\whisper-server.exe -m C:\whisper\models\ggml-base.bin --port 8081
```

The backend expects it on port 8081 (8080 is the backend). Wait until the window says it is listening.

## Optional settings (application.yml)

```yaml
whisper:
  base-url: http://localhost:8081
  language: auto        # or a code such as en, hi, mr
  timeout-seconds: 1800
```

To accept longer recordings, raise `spring.servlet.multipart.max-file-size` and `max-request-size`
(16 kHz audio is about 2 MB per minute; 50 MB is roughly 25 minutes).
