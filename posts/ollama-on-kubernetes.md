---
title: 'Running LLMs on Kubernetes with Ollama'
linkText: 'Running LLMs on Kubernetes with Ollama'
date: 'December 31 2024'
thumbnail: 'ollama_kubernetes.png'
tags: 'kubernetes, llm, ai'
excerpt: 'Orchestrating LLMs on Kubernetes with Ollama'
draft: false
---

The integration of Large Language Models (LLMs) into applications has become an essential part of innovative solutions. Running these models in a Kubernetes environment can bring scalability, fault tolerance, and efficiency to your AI workflows. In this blog post, we will explore how you can deploy and manage LLMs on Kubernetes.

I'm not going to fully touch the parts of scaling, but I will guide you through with this setup to have the basics, so once you do need to scale it, it will be possible.

The full manifests repo is here: [ollama-kubernetes](https://github.com/edenreich/ollama-kubernetes).

## Why Run LLMs on Kubernetes?

Kubernetes provides a robust orchestration layer for managing containerized applications. For LLMs, Kubernetes offers:

- **Scalability**: Scale your models dynamically based on demand.
- **High Availability**: Ensure continuous operation even if some nodes fail.
- **Resource Efficiency**: Optimize GPU and CPU usage through resource scheduling and quotas.
- **Flexibility**: Deploy multiple models or services side by side.

## Getting Started with Ollama-Kubernetes

The `ollama-kubernetes` repository provides a streamlined way to deploy LLMs. Let’s walk through the steps to get started.

### Prerequisites

Before diving in, ensure you have the following:

1. **flox**: Used for the virtual environment, we'll deploy everything locally.
2. **docker**: For running the local cluster.

### Clone the Repository

Start by cloning the `ollama-kubernetes` repository:

```bash
git clone https://github.com/edenreich/ollama-kubernetes.git
cd ollama-kubernetes
```

### Review the Manifests

I kept everything simple, by using kubernetes vanilla manifests, this also helps to understand how it structured, I didn't want to reach helm because it comes with a lot of templating and could be hard to understand.

At the beginning I reached a repository that claims to have a Kubernetes Operator with CRDs which seemed to be official from Ollama, apparently it's not, and I figured it's partially implemented so I've decided to skip it.

- **01-namespace**: The namespace I choose to deploy all the LLMs called `ollama`.
- **02-config**: Contains the environment variables for each Ollama server.
- **03-deployment**: The deployment file contains the necessary deployment specs - the model I choose to use is side-car, the side-car container will pull the model on startup and serve it. So each LLM can be completely decoupled by pod when deployed. I left a comment for the nvidia GPUs which you can enable if you bring the workload to a production cluster that has GPUs
- **04-service**: I'm defining the service port, from 8080 to the container port 11434.

### Create the Cluster

When running it just locally to experiment with it. Just run:

```sh
flox activate
task cluster-create
```

You should have a running 3 node cluster.

### Deploy to Kubernetes

To deploy the LLM as a service (let's start with the small model, to make sure it fits on the local hardware):

```bash
kubectl apply -f ollama/phi3/
```

It may take some time to download the LLM, so be patient, the container will be up and running once the LLM has been downloaded.

### Verify the Deployment

Check the status of your pods:

```sh
kubectl get pods
```

You should see pods running the LLM service. To access the API:

1. Forward the service port locally:

```sh
kubectl -n ollama port-forward svc/ollama 8080:8080
```

2. Test the API:

```sh
curl http://localhost:8080/api/tags
```

This will retrieve the LLM that was pulled earlier via the API.

## GPU Support

If your cluster supports GPUs, ensure the `NVIDIA` device plugin is installed. It could be installed via helm chart on all cloud providers.

Don't forget to comment back in the `nvidia.com/gpu` resource quotas, so the pod will be automatically scheduled on the nodes that have sufficient nvidia GPUs.

## OpenWeb-UI

You can interact with the model using port-forward and a bunch of curl requests from the terminal to generate responses or...

You can interact with it like I like to do, by simply using `OpenWeb-UI` which is fully open source - it's awesome.

The interaction with the API directly, only make sense if you're planing to build agents. If you'd like me to cover it, let me know.

Back to the subject,

To deploy it:

```sh
kubectl apply -f openweb-ui/
```

## OpenWeb-UI Configurations

Note that there is an environment variable `OLLAMA_BASE_URLS` - a `;` separated list of the deployed LLMs services. So if you deploy another LLM ensure to add an entry so it will be discoverable by the UI.

## Conclusion

Running LLMs on Kubernetes is super simple, once you get the initial setup correctly.

There are some solutions out there for kubernetes, but they are not tailored for LLMs, so I've decided to drop them. Also for clarity you can think about it more of a guide like "Kubernetes the hard way" to understand the fundamentals without many abstractions that reduces clarity.
With this building-blocks you can take that same solution and implement an helm chart easily or perhaps use the kubernetes operator once it's a more mature project.

Using OpenWeb-UI can help you get a seamless experince as if you are using ChatGPT. Personally I like the features of OpenWeb-UI better, due to it's flexibility and the fact that it's fully open source.

Now that you have the fundamentals how to deploy the LLMs and interact with them with a UI, you can easily add Home-assistant, which is also fully open-source into the mix and communicate with those local LLMs using your voice, which will allow you to communicate with your home smart devices.

Running an LLM fully locally can be cost effective, not as expensive as you might think.

All the manifests and a quick guide is in [here](https://github.com/edenreich/ollama-kubernetes).

If you'd like me to cover deploying and managing Home-assistant, how to deploy this on Google Kubernetes Engine, let me know.

Let me know what you think or if you have any questions, by dropping a comment down below.
