---
title: 'Building AI Agents for Kubernetes Using the Inference Gateway (Rust SDK)'
linkText: 'Inference Gateway(Rust SDK)'
date: 'Jan 22 2025'
thumbnail: 'inference_gateway.png'
image: 'inference_gateway.png'
tags: 'linux, kubernetes, llm, ai, rust'
excerpt: 'Artificial intelligence workloads have become a cornerstone of modern applications, and Kubernetes is at the forefront of container orchestration'
draft: false
---

Artificial intelligence workloads have become a cornerstone of modern applications, and Kubernetes is at the forefront of container orchestration. Whether you’re building intelligent chatbots, computer vision pipelines, or sophisticated language models, integrating AI capabilities seamlessly into a Kubernetes environment is essential. In this guide, we will build a logs errors analyzer for a Kubernetes cluster using AI. This tool will help you automatically detect and analyze errors in your cluster logs, making your AI model inference workflows more flexible, reliable, and easier to manage.

The advantage of using the Inference Gateway is that it abstracts away the complexity of calling AI models, allowing you to switch between different providers without changing your application code. This flexibility is crucial when working with multiple AI models or providers in a Kubernetes environment. You are not tied to a single provider, and you can leverage the best AI models for your specific use case.

In this blog post, we’ll dive into:

1. What [Inference Gateway](https://github.com/inference-gateway/inference-gateway) Is
2. How to Use the Rust SDK
3. Deploying a simple AI Agent, Log-analyzer, on Kubernetes
4. Best Practices and Tips

## What Is Inference Gateway?

An open-source, high-performance gateway unifying multiple LLM providers, from local solutions like Ollama to major cloud providers such as OpenAI, Groq Cloud, Cohere, Google, Anthropic and Cloudflare. This abstraction allows you to:

- Switch between different AI providers without changing your application code.
- Leverage advanced features like load-balancing, custom request routing, and caching.
- Standardize your AI inference calls through a single, cohesive API.

By deploying Inference Gateway in your Kubernetes cluster, you can manage, scale, and secure these inference endpoints more easily.

## How to Use the Rust SDK

The Inference Gateway provides an SDK for Rust (among other languages) that simplifies calling models through the Gateway’s unified API.

1. Project Setup

Start by creating a new Rust project:

```bash
cargo new ai-agent
cd ai-agent
```

2. Add the Inference Gateway Rust SDK to your `Cargo.toml` by running:

```bash
cargo add inference-gateway-sdk
```

The Cargo.toml file should now include the SDK dependency:

```toml
[package]
name = "ai-agent"
version = "0.1.0"
edition = "2021"

[dependencies]
inference-gateway-sdk = "0.5.8"
```

3. Let's also add the `tokio` runtime to our dependencies:

```bash
cargo add tokio --features rt-multi-thread,macros,signal
```

The Cargo.toml file should now include the `tokio` dependency:

```toml
[package]
name = "ai-agent"
version = "0.1.0"
edition = "2021"

[dependencies]
inference-gateway-sdk = "0.5.8"
tokio = { version = "1.43.0", features = ["rt-multi-thread", "macros", "signal"] }
```

## Building the AI Agent - Log Analyzer

Let's update src/main.rs file with the following code:

```rust
use inference_gateway_sdk::{
    InferenceGatewayAPI,
    InferenceGatewayClient,
    Message,
    MessageRole,
    Provider,
    GatewayError,
};
use std::time::Duration;
use tokio::signal::ctrl_c;

#[tokio::main]
async fn main() -> Result<(), GatewayError> {
    println!("Starting AI Agent... Press Ctrl+C to exit");

    loop {
        // Handle Ctrl+C
        tokio::select! {
            _ = ctrl_c() => {
                println!("\nReceived shutdown signal, exiting...");
                break;
            }
            _ = process_logs() => {}
        }
    }
    Ok(())
}

async fn process_logs() -> Result<(), GatewayError> {
    // 1. Create a client pointing to your Inference Gateway instance
    let client = InferenceGatewayClient::new("http://localhost:8000");

    // 2. Construct a sample log payload
    let logs = "Error: Connection refused in pod my-service-pod\nWarning: Low disk space on node 01\nError: Timeout accessing DB in deployment user-service";

    // 3. Prepare messages
    let messages = vec![
        Message {
            role: MessageRole::System,
            content: "You are an SRE, and you've been tasked with analyzing the following logs for errors. Please provide a summary of the issues found.".to_string()
        },
        Message {
            role: MessageRole::User,
            content: logs.to_string()
        }
    ];

    // 4. Send request to the LLM, in this case, I want to use a fully local LLM so I chose the Ollama provider
    let resp = client.generate_content(Provider::Ollama, "phi4:14b", messages).await?;

    // 5. Print the response
    println!("Response: {:?}", resp.response.content);

    // 6. Sleep before next iteration
    tokio::time::sleep(Duration::from_secs(60)).await;
    Ok(())
}
```

This code uses the Inference Gateway to process logs for errors. Customize the prompt or model parameters based on your needs. This prompt is not written in stones, feel free to change it to fit your needs and experiment with different models.

## Deploying the AI Agent on Kubernetes

1. Create a local kubernetes cluster using `k3d`:

```bash
k3d cluster create my-cluster --registry-create my-registry:5005
```

2. Create a Dockerfile for your AI agent:

```Dockerfile
# Stage 1: Builder
FROM rust:1.84-slim AS builder
WORKDIR /app

# Install OpenSSL development packages
RUN apt-get update && \
    apt-get install -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy source code
COPY . .

# Build release binary
RUN cargo build --release

# Stage 2: Runtime using distroless
FROM gcr.io/distroless/cc-debian12
COPY --from=builder /app/target/release/ai-agent /
USER nonroot:nonroot
ENTRYPOINT ["/ai-agent"]
```

3. Build and package the Rust project:

```bash
docker build -t localhost:5005/ai-agent .
docker push localhost:5005/ai-agent
```

4. Create a deployment YAML file for Kubernetes:

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-agent
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ai-agent
  template:
    metadata:
      labels:
        app: ai-agent
    spec:
      containers:
        - name: ai-agent
          image: my-registry:5005/ai-agent
          imagePullPolicy: Always
```

5. Apply the deployment to your Kubernetes cluster:

```bash
kubectl apply -f deployment.yaml
```

6. Monitor the logs of your AI agent:

```bash
kubectl logs -f ai-agent
```

## Best Practices and Tips

- **Use the Inference Gateway SDK**: The SDK abstracts away the complexity of calling AI models, making it easier to integrate them into your applications.
- **Monitor and Scale**: Monitor your AI agent’s performance and scale it based on the workload. Kubernetes makes it easy to scale deployments up or down.
- **Secure Your AI Agent**: Ensure that your AI agent is secure by following best practices like using secrets for sensitive information and setting up network policies.

## Conclusion

In this guide, we built an AI agent for Kubernetes using the Inference Gateway Rust SDK. We learned how to use the SDK to call AI models, deploy the AI agent on Kubernetes, and follow best practices for managing AI workloads. By following these steps, you can build intelligent applications that leverage AI capabilities seamlessly in a Kubernetes environment.

The Inference Gateway project is actively maintained and supports multiple languages, making it easy to integrate AI models into your applications. Check out the project’s GitHub repository for more information and examples. Happy coding!

In production environment you would need to setup a service account for your AI agent to access the Kubernetes API in a read only mode for the pod logs. This is out of scope for this blog post, but you can find more information in the Kubernetes documentation.

Let me know in the comment down below if you'd like me to write a follow-up post on how to setup a service account for your AI agent.
