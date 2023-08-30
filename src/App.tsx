import { useRef, useState, useEffect } from "react";
import OpenAI from "openai";
import ReactMarkdown from "react-markdown";

const createClient = (apiKey: string): OpenAI => {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

const globalStyles = {
  fontFamily: "Arial",
  fontSize: 18,
  maxWidth: 500,
};

function App() {
  const [apiKey, setApiKey] = useState("");
  const [openAIClient, setOpenAIClient] = useState<OpenAI | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const authenticated = openAIClient !== null;
  const [audioText, setAudioText] = useState("");
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      setChunks((prevChunks) => [...prevChunks, e.data]);
    };
    mediaRecorder.start();
    setRecorder(mediaRecorder);
  };

  const stopRecording = () => {
    recorder?.stop();
    const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
    const audioURL = window.URL.createObjectURL(blob);
    audioRef.current!.src = audioURL;
    setChunks([]);
    setRecorder(null);
    setFile(
      new File([blob], "recorded-audio.oga", { type: "audio/ogg; codecs=opus" })
    ); // convert Blob to File
  };

  useEffect(() => {
    const storedApiKey = localStorage.getItem("API_KEY");
    if (storedApiKey) {
      setOpenAIClient(createClient(storedApiKey));
    }
  }, []);

  const saveApiKeyAndSetupConfig = () => {
    localStorage.setItem("API_KEY", apiKey);
    setOpenAIClient(createClient(apiKey));
  };

  const buttonPressed = async () => {
    if (file && openAIClient) {
      const resp = await openAIClient.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
      });
      setAudioText(resp.text);
    }
  };
  const handleChange = (event: any) => {
    setFile(event.target.files[0]);
  };
  return (
    <div style={globalStyles}>
      {!authenticated && (
        <>
          <input
            type="password"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button onClick={saveApiKeyAndSetupConfig}>Save API Key</button>
        </>
      )}
      {authenticated && (
        <>
          <p>✅ Authenticated!</p>
          <div>{audioText && <ReactMarkdown>{audioText}</ReactMarkdown>}</div>
          <h1>Upload Audio File</h1>
          <input type="file" onChange={handleChange} />
          <button onClick={buttonPressed} type="submit">
            Upload
          </button>
          <h1>Or Record Audio Below</h1>
          <button onClick={startRecording}>Start recording</button>
          <button onClick={stopRecording}>Stop recording</button>
          <audio ref={audioRef} controls />
        </>
      )}
    </div>
  );
}

export default App;
