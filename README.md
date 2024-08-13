
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

![client-llm](https://github.com/user-attachments/assets/b351cdba-c4c5-4e54-9acd-63e9e52574ee)


![openfeature-llm](https://github.com/user-attachments/assets/22c3a623-9e4e-4ad6-a8cc-3a2ce3bc2bc6)


![logs-2](https://github.com/user-attachments/assets/c37c6030-a08b-48e3-acd7-9a52cbed74d8)


![LLM-logs](https://github.com/user-attachments/assets/46ba6ab6-0332-4bbb-ac3b-414e2c075db4)


