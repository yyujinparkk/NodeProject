const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor, NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { trace } = require("@opentelemetry/api");

const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Module exports a function that configures and returns a tracer
module.exports = (serviceName) => {
    // Configure the Jaeger Exporter
    const exporter = new JaegerExporter({
        // Jaeger Collector endpoint
        endpoint: 'http://localhost:14268/api/traces',
        serviceName: serviceName,
    });

    // Initialize a provider for node-based applications with a specific service name
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });

    // Attach the Jaeger Exporter to the provider using a SimpleSpanProcessor
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

    // Register the provider
    provider.register();

    // Register instrumentations
    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    // Return the tracer from the provider
    return trace.getTracer(serviceName);
};