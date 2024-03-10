---
title: 'Kubernetes for local development with Kubernetes in Docker(KinD)'
description: 'Kubernetes for local development with Kubernetes in Docker(KinD)'
date: 'April 19 2020'
thumbnail: 'thumbnail_kind.png'
tags: 'kubernetes, development-tools'
excerpt: "In this short tutorial we're going to create 3 node cluster with a Metal LB deployed so we can test our services locally..."
draft: false
---

As we all know there are few tools out there to use the Kubernetes for local development, just to name a few - minikube, draft etc, however those tools are mostly consuming a lot of time to create, due to the fact they are creating nodes in a hardware based virtualization rather than process based virtualizations. The main advantage of using a process based virtualizations is the speed of the creation for those instances.

![Kubernetes in Docker](/img/posts/kind.png 'KinD')

In this short tutorial we're going to create 3 node cluster with a Metal LB deployed so we can test our services locally. duration of creating a cluster on the cloud is normally 5 to 10 min, whereas for us creating it locally should take at most 3 min, this is especially useful when you quickly want to test stuff.

For simplicity purposes this tutorial is going to assume you're running these commands on a linux OS.

## [Prerequisites](#prerequisites)

To start we need to have docker installed:

```shell
curl -sSL https://get.docker.com | sh
```

We'll also need to download KinD binary and put it in our system path:

```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.9.0/kind-linux-amd64
chmod +x ./kind
mv ./kind /usr/local/bin/kind
```

Now that we have both required components installed, we need to create simple directory for our project or change directory to our existing project:

```sh
mkdir kind-tutorial
cd kind-tutorial
```

## [Create the cluster](#create-the-cluster)

In our project we'll create the manifest **kubernetes-local-cluster.yaml** that tells **KinD** how many nodes and of what type we need:

```sh
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
- role: worker
```

Everything is now ready for creation, so let's create the cluster by running:

```sh
kind create cluster --name local-cluster --config kubernetes-local-cluster.yaml
```

After approx. 3 min the cluster should be ready and you should be able to list the nodes (for this you'll of course need the Kubernetes client **kubectl**, so ensure you've it downloaded and available in your path):

```sh
kubectl cluster-info
kubectl get nodes
```

By running the following command you should see a similar output as the following:

```sh
Kubernetes master is running at https://127.0.0.1:42487
KubeDNS is running at https://127.0.0.1:42487/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

```sh
local-cluster-control-plane   Ready    master   106s   v1.19.1
local-cluster-worker          Ready    <none>   72s    v1.19.1
local-cluster-worker2         Ready    <none>   72s    v1.19.1
local-cluster-worker3         Ready    <none>   72s    v1.19.1
```

Now that we've successfully created the kubernetes cluster locally, we need a way to be able to expose services. As you may know on a cloud environment of Kubernetes if you want to have a service exposed you'll set **type: LoadBalancer** on the service manifest and the kubernetes API will pickup the request using a k8s operator to provision a load-balancer by the cloud provider and associate it with your cluster. However on a local environment we don't have such API available and the k8s operator detect that you're using kubernetes on a bare metal and would simply leave the external ip address on pending status. We need a way to expose services to our local machine, to solve this issue we'll deploy MetalLB in our cluster, on the high level MetalLB providing us a way to load balance between the nodes (using speakers and ) targeting on-premises / bare metal servers, I won't get too deep into details because there is much more to it how this load balancer work and those are just implementation details, if you're curious you can always refer to the [documentation of Metal LB](https://metallb.universe.tf/).

## [Deploy MetalLB](#deploy-metallb)

To deploy MetalLB we can follow the docs on [MetalLB website](https://metallb.universe.tf/installation/):

```sh
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.5/manifests/namespace.yaml
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.9.5/manifests/metallb.yaml
# On first install only
kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
```

Output should be as follow:

```sh
namespace/metallb-system created
```

```sh
podsecuritypolicy.policy/controller created
podsecuritypolicy.policy/speaker created
serviceaccount/controller created
serviceaccount/speaker created
clusterrole.rbac.authorization.k8s.io/metallb-system:controller created
clusterrole.rbac.authorization.k8s.io/metallb-system:speaker created
role.rbac.authorization.k8s.io/config-watcher created
role.rbac.authorization.k8s.io/pod-lister created
clusterrolebinding.rbac.authorization.k8s.io/metallb-system:controller created
clusterrolebinding.rbac.authorization.k8s.io/metallb-system:speaker created
rolebinding.rbac.authorization.k8s.io/config-watcher created
rolebinding.rbac.authorization.k8s.io/pod-lister created
daemonset.apps/speaker created
deployment.apps/controller created
```

```sh
secret/memberlist created
```

To verify that our MetalLB deployment went successfully, we can issue the following command and ensure you get a similar output:

```sh
kubectl -n metallb-system get all
```

Output should be like the following:

```sh
NAME                              READY   STATUS    RESTARTS   AGE
pod/controller-65db86ddc6-qp5s5   1/1     Running   0          10m
pod/speaker-66dhl                 1/1     Running   0          10m
pod/speaker-c5pdx                 1/1     Running   0          10m
pod/speaker-cxzp7                 1/1     Running   0          10m
pod/speaker-q2ddw                 1/1     Running   0          10m

NAME                     DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR            AGE
daemonset.apps/speaker   4         4         4       4            4           kubernetes.io/os=linux   10m

NAME                         READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/controller   1/1     1            1           10m

NAME                                    DESIRED   CURRENT   READY   AGE
replicaset.apps/controller-65db86ddc6   1         1         1       10m
```

Now that we've MetalLB successfully deployed in our local cluster and all Metallb speakers are on a running state, we need to configure MetalLB and tell it about our IP range that we want to reserve for the purpose of exposing deployments with Load Balancers, so we'll create a **metallb-config.yaml** with the following content:

```sh
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: metallb-system
  name: config
data:
  config: |
    address-pools:
    - name: default
      protocol: layer2
      addresses:
      - 172.19.xxx.xxx-172.19.xxx.xxx
```

To figure out what range you should specify in the metallb configurations you can run the following command to first get the running nodes ip addresses:

```sh
docker inspect network kind | grep IPv4Address
```

Output should be similar to mine if you're running docker on linux:

```sh
"IPv4Address": "172.19.0.2/16",
"IPv4Address": "172.19.0.5/16",
"IPv4Address": "172.19.0.4/16",
"IPv4Address": "172.19.0.3/16",
```

This tells us that we can use the ip range of **172.19.255.1 - 172.19.255.250**, so we'll modify the metallb configurations created earlier to use that range, save it and deploy it to the cluster:

```sh
kubectl create -f metallb-config.yaml
```

If you followed this tutorial and reach this point by now, you should be able to create a deployment and expose it with an LB layer 2 in your local cluster, let's verify that it works:

```sh
kubectl create deploy nginx --image nginx
```

Now let's expose the deployment and watch for changes:

```sh
kubectl expose deploy nginx --port 80 --type LoadBalancer
watch kubectl get svc
```

Output should be like the following:

```sh
NAME         TYPE           CLUSTER-IP      EXTERNAL-IP    PORT(S)        AGE
kubernetes   ClusterIP      10.96.0.1       <none>         443/TCP        77m
nginx        LoadBalancer   10.96.214.126   172.19.255.1   80:31048/TCP   5s
```

Alright, let's curl it:

```sh
curl http://172.19.255.1
```

And you should see now the default welcome page of your nginx deployment :) Now of course you could create multiple deployments locally that are exposed by multiple services within that specified ip range.

That's it for this tutorial, to recap the skills we've gained after reading this:

- [x] The ability to create a local cluster very quickly, without extra hardware needed
- [x] Test http services with MetalLB on a local cluster

Hope you'll find this article very useful for your local development.
