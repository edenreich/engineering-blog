---
title: 'ArgoCD Preview Environments'
linkText: 'ArgoCD Preview Environments'
description: 'ArgoCD Preview Environments'
date: 'March 10 2024'
thumbnail: 'argocd.png'
image: 'argocd.png'
tags: 'gitops, kubernetes'
excerpt: 'ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes.'
draft: false
---

`ArgoCD` is a declarative, `GitOps` continuous delivery tool for Kubernetes. It follows the `GitOps` principle of using Git as a 'single source of truth' for declarative infrastructure and applications. One of the powerful features of `ArgoCD` is the ability to create preview environments.

## What is a Preview Environment?

A preview environment is a replica of your production environment where you can preview your changes before they go live. This includes not just application code changes, but also infrastructure, configuration, and more.

## Why Use ArgoCD for Preview Environments?

`ArgoCD's` declarative model is perfectly suited for managing preview environments. By defining your environment as code in a Git repository, `ArgoCD` ensures that your Kubernetes cluster aligns with this desired state. This not only simplifies the process of creating and dismantling environments as required but also optimizes resource utilization. By automatically tearing down unused environments, `ArgoCD` helps to prevent wasting resources, leading to significant cost savings and easier maintenance.

## How to Create a Preview Environment with ArgoCD

To create a preview environment with `ArgoCD`, you would typically follow these steps:

Define your environment as code in a Git repository. This could include Kubernetes manifests, Helm charts, Kustomize applications, and more.

Create an `ArgoCD` Application that points to this Git repository and the desired path within it:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: preview-environments
spec:
  generators:
    - pullRequest:
        github:
          # The GitHub organization or user.
          owner: myorg
          # The Github repository
          repo: myrepository
          # For GitHub Enterprise (optional)
          api: https://git.example.com/
          # Labels is used to filter the PRs that you want to target. (optional)
          labels:
            - preview
        requeueAfterSeconds: 1800
  template:
    metadata:
      name: 'myapp-{{.branch}}-{{.number}}'
    spec:
      project: 'my-project'
      source:
        repoURL: 'https://github.com/myorg/myrepo.git'
        targetRevision: '{{.head_sha}}'
        path: kubernetes/
        helm:
          parameters:
            - name: 'image.tag'
              value: 'pr-{{.head_sha}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: default
```

The template in this context is essentially a standard `ArgoCD Application`. Assuming you're already familiar with creating an `ArgoCD Application`, let's provide a quick recap. The template requires you to specify the application's name, the repository, and the path to the Helm chart. Lastly, you need to define the target cluster and namespace for the deployment.

The `generators` field is where you specify how new `Applications` should be created. In this case, it's using a pullRequest generator with GitHub as the source. This generator will create a new Application for each open Pull Request in the specified GitHub repository (myorg/myrepository).

Use ArgoCD's CLI or API to create a new instance of this Application for your preview environment. You can parameterize your Application to customize each environment as needed (for example, to use a different database for each environment).

ArgoCD will then sync this Application with your Kubernetes cluster, creating the necessary resources.

Once you've finished with the preview environment, there's no need for manual cleanup. The `requeueAfterSeconds` field is configured to 1800 seconds (equivalent to 30 minutes). This means that the generator will automatically scan for new Pull Requests every half an hour and remove any preview applications that are no longer linked to an existing Pull Request.

## Pull Requests / Merge to Deploy

As with any technology, there's always a possibility of misinterpreting its purpose and using it incorrectly.

In traditional development workflows, developers often deploy changes by clicking a button. While this may seem like the correct approach initially, it's not the most effective method when using `ArgoCD`.

`ArgoCD` operates on the principle of declarative configuration. This means you specify the desired state of your application, rather than the steps to achieve it. Consequently, the concept of a 'deploy button' doesn't align with `ArgoCD's` philosophy.

While it's technically feasible to keep an application `out of sync` and only initiate the `sync` when you're ready to deploy, this approach is strongly discouraged. It's generally considered poor practice for several reasons. For instance, consider a scenario where a colleague returns from vacation and, unaware of the current state, triggers the sync from the UI after a week-long delay. This could inadvertently result in an idle feature being deployed to production, which was not the colleague's intention.

Instead, a more fitting approach with `ArgoCD` is to utilize Pull Requests. These Pull Requests can be reviewed and approved before merging. In this context, the act of merging a Pull Request effectively becomes the 'deploy action'. Once a Pull Request is merged, the changes are deployed, aligning with the declarative nature of `ArgoCD`.

Within a Pull Request, it's also possible to identify the changes that caused the application to break. These changes can then be easily reverted, adhering to `GitOps` principles.

## Conclusion

`ArgoCD's` preview environments provide a powerful tool for testing changes in a safe, isolated environment before they go live. By defining your environments as code and using `ArgoCD` to manage them, you can ensure consistency and repeatability across your environments, reducing the risk of issues in production.
