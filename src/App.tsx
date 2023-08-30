import React, { useState, useEffect } from "react";
import OpenAI from "openai";
import ReactMarkdown from "react-markdown";

const createClient = (apiKey: string): OpenAI => {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

interface Message {
  sender: Sender;
  contents: string;
}

enum Sender {
  Me = "Me",
  ChatGPT = "ChatGPT",
}

const globalStyles = {
  fontFamily: "Arial",
  fontSize: 18,
  maxWidth: 500,
  minWidth: 500,
};

function App() {
  const [apiKey, setApiKey] = useState("");
  const [openAIClient, setOpenAIClient] = useState<OpenAI | null>(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const authenticated = openAIClient !== null;

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

  const completion = async (fullPrompt: string) => {
    if (!openAIClient) return null;
    const chat_completion = await openAIClient.chat.completions.create({
      model: "gpt-4-32k",
      messages: [{ role: "user", content: fullPrompt }],
    });
    return chat_completion;
  };

  const buttonPressed = async () => {
    if (prompt && openAIClient) {
      const res = await completion(prompt);
      const content = res!.choices
        .map((c: any) => c.message!.content)
        .join("\n");
      setMessages([
        ...messages,
        { sender: Sender.Me, contents: prompt },
        { sender: Sender.ChatGPT, contents: content },
      ]);
    }
  };

  console.log(messages);
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
          <span>
            <p>Send previous responses?</p>
          </span>
          <div>
            {messages.map((m) => {
              return (
                <div
                  style={{
                    backgroundColor:
                      m.sender == Sender.ChatGPT ? "white" : "lightgrey",
                  }}
                >
                  <span>
                    {m.sender}: <ReactMarkdown>{m.contents}</ReactMarkdown>
                  </span>
                </div>
              );
            })}
          </div>
          <input type="text" onChange={(e) => setPrompt(e.target.value)} />
          <button onClick={buttonPressed}>Send</button>
        </>
      )}
    </div>
  );
}

export default App;
