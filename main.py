import openai

with open('secret', 'r') as secret_file:
    secret = secret_file.read()
    openai.api_key = secret

with open("journal-entry.m4a", "rb") as audio_file:
    # Despite being `whisper-1`, it's actually the `whisper-v2-large` model
    transcript = openai.Audio.transcribe("whisper-1", audio_file)

print(transcript)
