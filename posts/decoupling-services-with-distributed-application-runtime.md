---
title: 'Loosely coupled Micro-services with Distributed Application Runtime(DAPR)'
linkText: 'DAPR'
date: 'April 09 2022'
thumbnail: 'distributed_application_runtime.svg'
tags: 'event-driven architecture, go'
excerpt: "Distributed Application Runtime is a great way to decouple application's specific logic from operational distributed messaging"
draft: false
---

## What is DAPR ?

**DAPR** stands for Distributed Application Runtime, it's a [**Cloud Native Computing Foundation(CNCF)**](https://www.cncf.io/) supported project that is well integrated into the Kubernetes space and aims to solve the sprawl of different tools for service to service communication by applying a unified solution, that is very declarative and flexible.

## Why DAPR ?

Some companies often end up with a sprawl of tools, some of them would use Kafka, some would use RabbitMQ, some would use Cloud Services like AWS Kinesis, SQS or Google PubSub etc.
The end goal of all of the above mentioned tools is usually to serve one purpose, being the broker for the messages which will be exchanged from service A to N number of services when using the publish/subscribe model(also known as pub/sub), and yet **DAPR** also can get more verbose than just a pub/sub model, there are tons of available configurations.
In this article I'm going to focus on the pub/sub model.

## Installation

To install **DAPR** in your cluster on its own namespace, run(beforehand make sure you have a ready cluster, feel free to follow the [example](https://github.com/edenreich/examples/tree/master/distributed-application-runtime)):

```sh
helm repo add dapr https://dapr.github.io/helm-charts
helm repo update
helm install \
    dapr dapr/dapr \
    --namespace dapr-system \
    --create-namespace \
    --wait
kubectl --namespace dapr-system get all
```

Then you need to configure a message broker, it could be anything you would like, just to name a few: Kafka, RabbitMQ, redis, Amazon SQS, Amazon Kinesis, Amazon SQS, Google Cloud PubSub. I'll choose to use redis:

```sh
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install \
    redis bitnami/redis \
    --namespace development \
    --create-namespace \
    --wait
```

After **DAPR** is deployed then we can proceed and create components with the provided [Custom Resource Definitions](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/).

## DAPR Use-cases ?

I'm going to focus in this article on the pub/sub model and I'll give some real world use-cases.

Let's consider the following architecture:

![Typical Ecommerce Architecture](/img/posts/dapr_architecture.png 'Typical Ecommerce Architecture')

Code for this example is provided in the following link: https://github.com/edenreich/examples/tree/master/distributed-application-runtime

As you can see in the diagram above there are 4 different micro-services: order, billing, notification and shipping.

Now that we have **DAPR** installed in our cluster we can create the components to tell **DAPR** where is our message broker and how to connect to it:

```yaml
---
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
    - name: redisHost
      value: redis-master.development.svc.cluster.local:6379
    - name: redisPassword
      secretKeyRef:
        name: redis
        key: redis-password
auth:
  secretStore: kubernetes
```

Now that **DAPR** can connect to our message broker, we can deploy the manifests that would tell **DAPR** what are the topics that the services are going to subscribe to, we're going to create 2 different subscriptions:

```yaml
---
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: order-subscription
spec:
  topic: orders
  route: /orders
  pubsubname: pubsub
scopes:
  - notification
  - billing
  - shipping
---
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: billing-subscription
spec:
  topic: bills
  route: /bills
  pubsubname: pubsub
scopes:
  - order
```

The billing-subscription / bills topic has only one subscriber which is **order service** and order events are going to be published to all different subscribers specified in the scope(i.e **notification** service, **billing** service and **shipping** service), they will receive the message on the expected endpoint **/orders**.
When a service declare the endpoint **/orders** the message would be received as a post request into the web-hook with the event payload, the consumer can then process the event. If returned 200 or 204 status code the message would be acknowledged, otherwise if returned non-ok status code (i.e above 400) the message would be redelivered, DAPR ensures delivery, this is nothing new to all other message brokers and that's how they normally work.

Last thing that is left to do, is to tell the different deployments that we need a Kubernetes [**sidecar container**](https://kubernetes.io/blog/2015/06/the-distributed-system-toolkit-patterns/#example-1-sidecar-containers) in our pods. Each sidecar container would be identified with a unique id. Also we need to tell it on what port the application is listening for connections. Those configurations could be deployed using Kubernetes annotations on the deployment manifest of each service. for **billing service** for example you would find the following annotations:

```yaml
---
annotations:
  dapr.io/enabled: 'true'
  dapr.io/app-id: 'billing'
  dapr.io/app-port: '8080'
```

I'm also using a configmap to declare some environment variables to tell the application which topics will be used for publishing the messages, the application then knows to split it by comma and publish the events to all of the topics specified on that comma separated list.

That's all we need, now let's deploy the applications, of course you don't have to write all of this by yourself, you can use the example and follow the [**README.md**](https://github.com/edenreich/examples/tree/master/distributed-application-runtime) guide, on this blog post I want to just focus on explaining what's happening.

Assuming you followed the example and you deployed the application, every time you create an order by sending a post request to the **order service**(for simplicity the order service, is just a dummy service that also generates a dummy order when you call it so you don't have to pass it any payload), the other services would be notified and process that order, you could use the **make load** command which will send a post request to the order service and simulate orders incoming.

Notice that all other services don't expose anything to the public, they are private, they just receive the event message and process the requests asynchronously.

If the system happens to go down, bringing back the services online would continue to process from where it stopped.

You could also automatically scale up the system by application [**HPA**](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) to the subscribing deployments, [**HPA**](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) is built-into Kubernetes core(I'm not going to go over how to scale up a deployment automatically but you can follow the Kubernetes docs, it's pretty straight forward).

If you decide one day to switch from Redis broker to another message broker like Kafka for example you can just replace the deployed **DAPR** component with Kafka for example for that specific environment without changing anything on the application code, all the application is aware of is that there is a sidecar service listening on the default port of **DAPR** which is **3500** and that's where the application is sending the payload, that would then be published to the corresponding subscribers by the proxy.

Notice that I'm also using CloudEvents specification, to make this code also compatible with Cloud functions, if you want for example you can publish those events to an AWS Lambda or Google cloud functions, and they will receive that event with the correct spec for further processing.

But this is not it yet, DAPR true power is not ended yet, now let's say we want to also add tracing to know how long it takes for each service to process a message so we can find out if there are any bottlenecks.

To achieve that all we need to do is deploy [**Zipkin**](https://zipkin.io/):

```sh
kubectl create namespace tracing
kubectl --namespace tracing create deployment zipkin --image=openzipkin/zipkin
kubectl --namespace tracing expose deployment zipkin --type ClusterIP --port 9411
kubectl --namespace tracing rollout status deployment zipkin
```

And configure **DAPR** to tell it where the **Zipkin** service is running, we'll use the internal **Zipkin** service we've just deployed, but you can always change that to another host if you need [**HA**](https://en.wikipedia.org/wiki/High_availability) etc:

```yaml
---
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
spec:
  tracing:
    samplingRate: '1'
    zipkin:
      endpointAddress: 'http://zipkin.tracing.svc.cluster.local:9411/api/v2/spans'
```

Lastly, we just need to add annotation to each deployment that we want to use this configuration:

```yaml
...
      annotations:
        dapr.io/config: "tracing"
        ...
...
```

Apply the new configurations to the deployment and the deployment is going to send tracing information to dapr without us needing to touch any application code. Behind the scenes the **DAPR** proxy sidecar is going to collect kernel system-calls and send them to zipkin, with the application id so we know by using the UI of zipkin what service has a bottleneck.

You can use zipkin Dashboard to inspect the different issues the application might have by port-forwarding the service to your local machine:

```sh
kubectl --namespace tracing port-forward svc/zipkin 9411:9411
```

And open it in your browser: **http://localhost:9411**

## Conclusion

**DAPR** is incredibly easy to configure and brings a lot of benefits in the long run, the application doesn't need to know where we publish the message, **DAPR** takes care of the underlying technology that is used for sending the messages to a given broker.

The broker that is used could be easily swapped, without any complex configurations or migrations.

**DAPR** is a [**CNCF**](https://www.cncf.io/) supported project, so you can gain some confidence about how mature this tool is, it's actually used by microsoft and some other companies in production.

By using **DAPR** you're ensuring that the infrastructure remains vendor neutral - today you can use Kafka Cloud, tomorrow you can switch to AWS kinesis streams, after tomorrow you can switch to your own solution running it using a cluster of Redis in memory-store. It avoids the [**vendor lock-in**](https://en.wikipedia.org/wiki/Vendor_lock-in) issue.

**DAPR** allows software developers to focus on the application side and abstract away the complex infrastructure so it's easier for the operation / infrastructure team to fulfill business requirements without interrupting the software developers workflow.

I think that **DAPR** finally brings a unified solution in the Cloud Native space for the different message brokers available, which IMO is a great step to abstract complexity and make it easier to scale and maintain complex service oriented architectures.

I kept the example project very simple without any SDK or client library so it's easier to understand what happens, if you want you can also use the [**SDK**](https://docs.dapr.io/developing-applications/sdks/) provided by **DAPR** for any type of programming language.

**Word of caution** - when you wish to go with **DAPR** to production don't use the example code provided in this article, and if you decide to go with it anyways to production then please make sure you take the necessary steps to make it fit(i.e the message broker probably deserve its own managed solution somewhere else outside of the cluster, separated from the rest of the services).
Please consider the example code as an example only.

Hope you enjoyed reading this article.
