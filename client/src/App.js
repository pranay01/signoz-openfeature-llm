import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [llmModel, setLlmModel] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/ask', { question });
      setAnswer(response.data.answer);
      setLlmModel(response.data.llmModel);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <h1>AI Q&A</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
        />
        <button type="submit">Submit</button>
      </form>
      {answer && (
        <div>
          <h2>Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
      <p>LLM Model: {llmModel}</p>
    </div>
  );
}

export default App;