---
title: 'Infrastructure as Data'
linkText: 'Infrastructure as Data'
date: 'December 04 2021'
thumbnail: 'yaml_files.png'
image: 'yaml_files.png'
tags: 'kubernetes, gitops'
excerpt: "Infrastructure as Data (IaD) isn't a new concept, it just gain a bit more popularity and attention since Kubernetes and Serverless started to appear"
draft: false
---

**Infrastructure as Data (IaD)** isn't a new concept, it just gained a bit more popularity and attention since Kubernetes and Serverless started to appear. I would assume that you're already familiar with the concept of **[Infrastructure as Code (IaC)](https://en.wikipedia.org/wiki/Infrastructure_as_code)**, so before I continue any further about **IaD**, I want first to explain the sequence of how those concepts started to evolve.
**IaC** first gained it's **major attention** when **[HashiCorp](https://en.wikipedia.org/wiki/HashiCorp)** released **[Terraform](<https://en.wikipedia.org/wiki/Terraform_(software)>)** in 2014 (just one year before Kubernetes officially started its journey in the open-source community).
People were starting to declare their infrastructure writing code with **HashiCorp Configuration Language (HCL)**. You would just write a small amount of **.tf** files and your infrastructure on any Cloud Provider out there would be provisioned, that was a major change in the way we think about managing infrastructure. The nice thing about Terraform is that it was also keeps the state, and compares it always with your current infrastructure when you want to add another VM instance.
People saw its potential and quickly started to **write modules** for their infrastructure based on **HCL**. Also imagine you had to maintain two different Cloud Providers, Terraform quickly became the most popular tool for managing a **Multi-Cloud environment**. It was and maybe still is a great tool for managing your infrastructure, but this article isn't just about **IaC** or **Terraform** (there are already many articles over the internet covering this topic), in this article I want to focus on another concept that recently got its attention called **IaD**.

So what's the **difference** between **IaD** and **IaC** approach ?

Well on a high-level the difference is simple - **IaD** uses popular data formats like **JSON** or **YAML** and **IaC** on the other hand uses code to declare the infrastructure, this code may also contain other bits of logic (i.e loops, ternary operators etc).

So why I would personally prefer to use **IaD** approach over **IaC**, in a nutshell:

- **YAML** configuration files do **not contain** any **custom logic** like **ternary operator, loops** etc. Results are **easier to predict**
- **YAML** configuration files are more portable
- Using **YAML** format for declarations in my perspective is **easy to write** and **to read**
- When using **Kubernetes** I can leverage the **reconciling loop** and ensure my infrastructure **remains in-sync** when manual edits are made to resources on the Cloud Provider **via** the **UI console**
- **IaC**, specifically **Terraform** (which is considered IMO the best tool for IaC) is not **fully GitOps** conform **by design**

Now some of you may argue, you can achieve the same using Terraform, and although it might be true, because there are some workarounds that allow Terraform to have **drift detection**, but it's not there by design, those are just workarounds.

Let's say you follow all the best practices of terraforming your infrastructure, you store the state file on a backend **Bucket Cloud Storage** (so the changes remain consistent). But then comes the scenario, that one of your co-workers decides to log into the Cloud Provider's UI Console and starts to edit some of the resources you managed with Terraform.
In these scenarios, you can run `terraform refresh`, to refresh the current state file with the real-world state, but what if you forget to run this ? or what if you actually don't want to fetch the latest state and you'd rather revert those changes that were made manually by your colleague, yes you can run `terraform refresh`, afterwards `terraform plan` and `terraform apply -auto-approve`, but IMO it becomes very tedious. **Terraform** doesn't track those scenarios, and you can have drifted state for a longer period of time until you actually finds out that something is broken, unless you run your **Terraform commands** on a scheduled basis, there is no way for you to know when something has been manually changed on the infrastructure and that your infrastructure is basically out of sync with what **Terraform** has in its state file.

Some companies would actually revoke all write / edit permissions of users who log into the UI console, then you at least can avoid people from editing things they should not edit, since those resources are already managed by Terraform, but IMO that's not a viable solution.

Considering the above mentioned workarounds and not having this reconciling feature by design makes Terraform fragile and this could be frustrating.

Meet [Crossplane](https://crossplane.io/), it's a **Kubernetes Add-On** that provides a set of [CRD's (Custom Resource Definitions)](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) for almost every Cloud Provider.
Installation is fairly simple, prerequisites are that you only need to have a Kubernetes cluster for hosting those YAML files.

If you want for example to create simple **Google Kubernetes Engine (GKE)** cluster on **Google Cloud Platform (GCP)** the YAML definition would look like:

```yaml
---
# API Reference: https://doc.crds.dev/github.com/crossplane/provider-gcp/container.gcp.crossplane.io/GKECluster/v1beta1@v0.16.0
apiVersion: container.gcp.crossplane.io/v1beta1
kind: GKECluster
metadata:
  name: my-gke-cluster
spec:
  forProvider:
    initialClusterVersion: '1.19'
    network: 'projects/<project_id>/global/networks/opsnet'
    subnetwork: 'projects/<project_id>/regions/us-central1/subnetworks/opsnet'
    ipAllocationPolicy:
      useIpAliases: true
    defaultMaxPodsConstraint:
      maxPodsPerNode: 110
    addonsConfig:
      cloudRunConfig:
        disabled: true
      dnsCacheConfig:
        enabled: false
      gcePersistentDiskCsiDriverConfig:
        enabled: true
      horizontalPodAutoscaling:
        disabled: true
      httpLoadBalancing:
        disabled: false
      istioConfig:
        disabled: true
        auth: 'AUTH_NONE'
      kalmConfig:
        enabled: false
      kubernetesDashboard:
        disabled: true
      networkPolicyConfig:
        disabled: false
    location: us-central1-a
    binaryAuthorization:
      enabled: false
    legacyAbac:
      enabled: false
    loggingService: 'none'
    masterAuth:
      clientCertificateConfig:
        issueClientCertificate: false
    monitoringService: 'none'
---
# API Reference: https://doc.crds.dev/github.com/crossplane/provider-gcp/container.gcp.crossplane.io/NodePool/v1alpha1@v0.16.0
apiVersion: container.gcp.crossplane.io/v1alpha1
kind: NodePool
metadata:
  name: my-np
spec:
  forProvider:
    autoscaling:
      autoprovisioned: false
      enabled: true
      maxNodeCount: 2
      minNodeCount: 1
    clusterRef:
      name: my-gke-cluster
    config:
      diskSizeGb: 100
      imageType: cos_containerd
      labels:
        test-label: crossplane-created
      machineType: n1-standard-4
      oauthScopes:
        - 'https://www.googleapis.com/auth/devstorage.read_only'
        - 'https://www.googleapis.com/auth/logging.write'
        - 'https://www.googleapis.com/auth/monitoring'
        - 'https://www.googleapis.com/auth/servicecontrol'
        - 'https://www.googleapis.com/auth/service.management.readonly'
        - 'https://www.googleapis.com/auth/trace.append'
    initialNodeCount: 2
    locations:
      - us-central1-a
    management:
      autoRepair: true
      autoUpgrade: true
```

Notice how clean that is, it's almost identical to the configurations when describing the cluster using **GCP** client, `gcloud container clusters describe my-gke-cluster --zone us-central1-a`. Both the **Cloud Provider** (which is Google) and **Crossplane** are talking the same language.

That's the beauty about it IMO, there is no need to write any custom code, written in different languages (i.e HCL), instead just define a YAML file and deploy it, that's it (IDE's also provide yaml-language-servers with schema for auto-completion to know what available options are there, and if not it's always possible to refer to the [documentation](https://crossplane.io/docs/v1.5/api-docs/overview.html)).

Although it brings us closer to **[GitOps workflow](https://www.gitops.tech/)**, it's still not perfect by itself, because in reality you don't want to run `kubectl apply -f <Above mentioned yaml files>` as it defeats the purpose of maintaining everything using Git Versioning. Additionally you can leverage another tool called **[ArgoCD](https://argo-cd.readthedocs.io/en/stable/)**, that will be configured to **watch** the git repository **for changes**, once you push those **YAML** files, **ArgoCD** will detect the changes and deploy it to the configured **Crossplane** cluster. If you remove this above mentioned file from the git repository, **ArgoCD** will detect that and delete **my-gke-cluster** mentioned above.
If one decides to log into **GCP** and **modify** the resources **manually**, i.e add another worker node to the cluster, this worker node would be deleted because the only source of truth is the YAML file definition that is stored in a git remote repository and is being tracked by Kubernetes API reconciling loop.

The following diagram visualize the way this workflow works:

![Infrastructure as data](/img/posts/infrastructure_as_data.png 'Infrastructure as data')

You could potentially also separate **ArgoCD** and **Crossplane** with two different clusters if you happen to need them to be **[Highly Available (HA)](https://en.wikipedia.org/wiki/High_availability)** for your configuration and avoiding [single point of failure (SPOF)](https://en.wikipedia.org/wiki/Single_point_of_failure), although since both domain logics handle configurations, and for simplicity purposes I've decided to have them in one single cluster, I think it's perfectly fine, depending on your specific use-case.

## Conclusion

Although I really like this **KNative Crossplane** tool, this article isn't just about that, I mentioned this tool because I think it's a great example for an **IaD** and it's resembles how the perfect **GitOps workflow** should be.

Although I used **Terraform** for many years and I really liked it for most use-cases, I want to mention that **Crossplane** isn't just yet a full replacement of Terraform (considering the amount of modules developed for Terraform etc), but it's getting there and it needs support from the open source community. If something is missing on their documentation or API you can easily support their project on [github](https://github.com/crossplane/crossplane) by sending them a pull request.

Personally I like the idea of having one to one configurations comparison, where with **IaC** I have to compare **Code** with **YAML** configurations provided by the different cloud providers, not ideal.

Using **Terraform** to manage your infrastructure requires less setup than **Crossplane** (i.e **for Terraform** you **don't need** to have it running inside of a **Kubernetes cluster**), but honestly creating a Kubernetes cluster isn't such a difficult task to do with today's tools, so if you look on the overall advantages and security policies you get out of the box, I think it's definitely worth it.
