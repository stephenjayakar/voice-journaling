import React, { useState, useEffect } from "react";
import OpenAI from "openai";
import ReactMarkdown from "react-markdown";

const createClient = (apiKey: string): OpenAI => {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

const globalStyles = {
  fontFamily: "Arial",
  fontSize: 18,
  maxWidth: 500,
  minWidth: 500,
};

function App() {
  const [apiKey, setApiKey] = useState("");
  const [openAIClient, setOpenAIClient] = useState<OpenAI | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const authenticated = openAIClient !== null;
  const [audioText, setAudioText] = useState("");

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
        </>
      )}
    </div>
  );
}

export default App;
