require('dotenv').config();
const express = require('express');
const winston = require('winston');
const cors = require('cors');
const { OpenFeature } = require('@openfeature/server-sdk');
const { LaunchDarklyProvider } = require('@launchdarkly/openfeature-node-server');
const { TracingHook } = require('@openfeature/open-telemetry-hooks');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const logsAPI = require('@opentelemetry/api-logs');
const { LoggerProvider, BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { OpenTelemetryTransportV3 } = require('@opentelemetry/winston-transport');

const app = express();
app.use(cors());
app.use(express.json());

const port = 3001;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


OpenFeature.addHooks(new TracingHook());

const loggerProvider = new LoggerProvider();

loggerProvider.addLogRecordProcessor(
    new BatchLogRecordProcessor(
        new OTLPLogExporter({
            url: 'https://ingest.eu.signoz.cloud:443/v1/logs',
            // headers: { 'signoz-access-token': config.signozAccessToken },
            // keepAlive: true,
        })
    )
);
logsAPI.logs.setGlobalLoggerProvider(loggerProvider);

async function flushLogger() {
    await loggerProvider.forceFlush();
}

const winstonLogger = winston.createLogger({

    exitOnError: false,

    transports: [new winston.transports.Console(), new OpenTelemetryTransportV3()],
});

let client;

async function initializeOpenFeature() {
  await OpenFeature.setProviderAndWait(new LaunchDarklyProvider(process.env.LAUNCHDARKLY_SDK_KEY));
  client = OpenFeature.getClient();
}

const context = {
  targetingKey: "user-key-123abc",
};

app.post('/api/ask', async (req, res) => {
  try {
    const llmModel = await client.getStringValue("llm-flag", 'openai', context);
    const { question } = req.body;
    winstonLogger.info("hello", {messageText : question});

    let answer;
    if (llmModel === 'openai') {
      answer = await callOpenAI(question);
    } else if (llmModel === 'anthropic') {
      answer = await callAnthropic(question);
    } else {
      throw new Error('Invalid LLM model');
    }

    res.json({ answer, llmModel });
  } catch (error) {
    console.error('Error in /api/ask:', error);
    winstonLogger.error(`Event Failed for ${error}`);
    res.status(500).json({ error: error.message });
  } await flushLogger()
});

async function callOpenAI(question) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      messages: [{ role: "user", content: question }],
      model: "gpt-3.5-turbo",
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Failed to get response from OpenAI');
  }
}

async function callAnthropic(question) {
  try {
    const completion = await anthropic.completions.create({
      model: "claude-2.1",
      max_tokens_to_sample: 1000,
      prompt: `Human: ${question}\n\nAssistant:`,
    });
    return completion.completion;
  } catch (error) {
    console.error('Error calling Anthropic:', error);
    throw new Error('Failed to get response from Anthropic');
  }
}

async function main() {
  try {
    await initializeOpenFeature();
    
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });

  } catch (error) {
    console.error('An error occurred during initialization:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Failed to run the application:', error);
  process.exit(1);
});