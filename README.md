## SigNoz OpenFeature LLM Demo


*Next Steps*

- [ ] Send logs to SigNoz with linked traceID. Logs should also have LLM processing times and feature flag as an attribute
- [ ] Trigger alerts based on logs or traces with feature flag data and call Launchdarkly API to change feature flag value if lert is triggered
- [ ] Above can be done using Zapier or a lambda function

### How to run the project

export OTEL_SERVICE_NAME="signoz-openfeature-llm"

Add `.env` file in root folder with: 

```
LAUNCHDARKLY_SDK_KEY=<your LD key>

OPENAI_API_KEY=<your OPENAI key>

ANTHROPIC_API_KEY=<your ANTHROPIC key>
```

### Run the server 

`OTEL_EXPORTER_OTLP_HEADERS="signoz-access-token=<SIGNOZ_INGESTION_KEY>" node --require ./tracing.cjs server.js`

### Run the client

`cd client`
`npm start`

