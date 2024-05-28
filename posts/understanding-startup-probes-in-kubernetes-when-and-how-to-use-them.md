---
title: 'The Forgotten Kubernetes Probes: Understanding Startup Probes and Their Importance'
date: 'May 28 2024'
thumbnail: 'kubernetes.png'
tags: 'kubernetes, optimization'
excerpt: 'While liveness and readiness probes are widely discussed, startup probes are equally crucial, particularly for applications with significant initialization times. This article delves into startup probes, explaining their purpose, configuration, and common practices.'
draft: false
---

Kubernetes, the leading container orchestration platform, offers several mechanisms to maintain the health and efficiency of applications running in a cluster. Among these mechanisms are **liveness**, **readiness**, and **startup** probes. This article assumes you are already familiar with liveness and readiness probes. While liveness and readiness probes are widely discussed, startup probes are equally crucial, particularly for applications with significant initialization times. This article focuses on startup probes, explaining their purpose, configuration, common pitfalls, and common practices.

## What are Startup Probes?

### Purpose

Startup probes are designed to manage application startup issues by ensuring that an application is given enough time to start before liveness and readiness probes are activated. This is particularly useful for applications that require an extended initialization period.

### Key Functions

- **Prevent Premature Failures:** Ensuring that liveness and readiness probes do not interfere with the application during its startup phase.

- **Handle Long Initialization:** Providing sufficient time for applications with complex or lengthy startup processes to become fully operational.

## When to Use Startup Probes

### Slow-Starting Applications

Applications that require significant time to initialize, such as those loading large datasets, establishing numerous connections, or performing intensive computations during startup, benefit from startup probes. Without a startup probe, liveness and readiness probes might mistakenly identify these applications as unhealthy and restart them prematurely.

### Heavy Initialization Processes

Applications that perform extensive setup operations, such as warming up caches, initializing large configuration files, or connecting to numerous external services, can use startup probes to complete these tasks without disruption.

### Critical Dependencies

Applications dependent on the availability of critical services or databases can use startup probes to ensure all dependencies are available and fully initialized before starting the main application processes.

### Complex Configuration and Bootstrapping

For applications with complex configuration and bootstrapping sequences, startup probes allow sufficient time to complete these sequences without being prematurely killed by liveness probes.

## Configuration of Startup Probes

Startup probes are configured similarly to liveness and readiness probes but typically have longer timeouts and fewer retries to accommodate the longer startup time. Here’s an example configuration:

```yaml
startupProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 30
```

In this configuration, Kubernetes will wait for **10 seconds** before sending the first request to **/healthz** on port **8080**. It checks every **10 seconds** and allows up to **30 failures** before marking the startup as failed.

## Common Pitfalls

### Missing Startup Probes
One common pitfall is neglecting to define startup probes for applications with long initialization times. Without a startup probe, liveness probes might incorrectly assume that the application is stuck or unresponsive, leading to repeated restarts. This can cause a cascade of failures, where the application never has enough time to fully start and stabilize.

### Insufficient Initial Delays
Setting too short an initial delay for the startup probe can result in premature checks, which may fail and trigger unnecessary restarts. It’s crucial to accurately estimate and configure the initial delay based on the application's startup characteristics.

### Misconfigured Failure Thresholds
Using a low failure threshold can also cause premature restarts. Ensure that the failure threshold is high enough to meet the application's worst-case startup time.

### Overlapping Probes
Improper coordination between startup, liveness, and readiness probes can lead to conflicts. Ensure that the startup probe has sufficient time to complete before liveness and readiness probes take over.

## Best Practices for Using Startup Probes

1. **Accurate Initial Delays:**
Set `initialDelaySeconds` to a value that allows the application to complete its initial setup tasks before the probe checks its status.

2. **Appropriate Check Intervals:**
Configure `periodSeconds` to balance between frequent checks and allowing enough time for the application to progress in its startup.

3. **High Failure Thresholds:**
Use a high `failureThreshold` to give applications enough time to start without being prematurely marked as failed.

4. **Continues Checks with Liveness and Readiness Probes:**
Once the application is started, liveness and readiness probes take over to ensure ongoing health and readiness to handle traffic.

5. **Monitor and Adjust:**
Continuously monitor the application's startup behavior and adjust the startup probe configuration as necessary to align with any changes in the startup process.

6. **Log and Debug:**
Implement detailed logging within the application’s startup process to facilitate debugging when startup probes fail.

## Example Scenario

Consider a Java application that loads a large dataset into memory upon startup. This initialization takes approximately 3 minutes. Without a startup probe, liveness and readiness probes might kill the container, assuming it's unresponsive. By configuring a startup probe with a sufficient initial delay and failure threshold, the application gets the necessary time to load the dataset fully before handling traffic.

```yaml
startupProbe:
  exec:
    command:
      - cat
      - /tmp/healthy
  initialDelaySeconds: 180
  periodSeconds: 10
  failureThreshold: 18
```

In this configuration, the startup probe checks for the presence of a **/tmp/healthy** file, which the application creates after completing its initialization.

You might wonder if you could achieve the same result by setting a long **initialDelaySeconds** on the liveness and readiness probes. However, this approach is not ideal because it leads to duplicated values and does not provide the same flexibility and clarity as using a dedicated startup probe. Startup probes are specifically designed for this purpose, ensuring that the initialization phase is handled correctly without interfering with the ongoing health checks managed by liveness and readiness probes.

## Conclusion
Startup probes are an essential in Kubernetes for managing the lifecycle of applications with long or complex startup sequences. They ensure that such applications have the necessary time to initialize fully before liveness and readiness probes begin their checks. By accurately configuring and utilizing startup probes, you can prevent premature restarts, ensuring that applications are healthy and ready to serve traffic once fully started. This enhances the resilience and reliability of your Kubernetes deployments.
However, not every application requires a startup probe. They are typically needed for slow-starting applications, so use them wisely to avoid unnecessary complexity in your configurations.
