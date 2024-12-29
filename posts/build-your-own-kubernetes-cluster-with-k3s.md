---
title: 'Build your own Kubernetes Cluster with K3S'
linkText: 'K3S'
date: 'June 19 2020'
thumbnail: 'thumbnail_raspberry_pi_cluster.jpeg'
tags: 'k3s, kubernetes, raspberry pi, bare-metal'
excerpt: "Creating your own kubernetes cluster on raspberry pi doesn't take much effort and it was a fun experience..."
draft: false
---

Creating your own kubernetes cluster on raspberry pi doesn't take much effort and it was a fun experience, in fact this blog at the time of writing this article is hosted on home made kubernetes. In this article i'm going to walk you through the process of having a production ready environment at your home.

![Raspberry pi cluster](/img/posts/raspberry_pi_cluster.jpeg 'Raspberry pi cluster')

## [Prerequisites](#prerequisites)

You'll need to purchase the following equipment in order to follow along (budget of around 600$, on the long run it pays off):

- 1x [Intelinet Socket Strips](https://www.amazon.de/gp/product/B01GUXUG3G/) approx. 30$
- 1x [Gifort Energy Cost Meter](https://www.amazon.de/gp/product/B07D7NKYQ3/) approx. 15$
- 1x [NETGEAR 8 port network switch](https://www.idealo.de/preisvergleich/OffersOfProduct/56755.html) approx. 35$
- 4x [Raspberry pi's 4 Model B](https://www.idealo.de/preisvergleich/OffersOfProduct/6628224_-4-model-b-4gb-raspberry-pi-foundation.html) approx. 65$/piece
- 4x [Samsung EVO Plus 128GB microSD cards](https://www.idealo.de/preisvergleich/OffersOfProduct/5514884_-evo-plus-2017-microsdxc-128gb-mb-mc128ga-samsung.html) approx 23$/piece
- 5x [Cat 7 with length of 75cm lan cables](https://www.idealo.de/preisvergleich/Typ/4061474034560.html) approx. 7$/piece
- 4x [USB type-A to type-C cables](https://www.amazon.de/dp/B07D7S4SLL/) approx. 8$/piece
- 2x [AmazonBasics USB hubs](https://www.amazon.de/dp/B076YNV36K/) approx. 50$/piece
- 1x [Raspberry pi acrylic tower](https://www.amazon.de/dp/B07Y8VG933/?smid=A2HSFPQG9EH8HP) approx. 20$

You would also need a cloudflare account, so we can put it in front of our cluster entry for higher security, and a single domain name registered. Personally I like [www.hover.com](https://www.hover.com/), they have good range of servers across the globe which means less time resolving your ip address, I also like their service. feel free however to purchase your domain by any other dns provider.

P.S: I'm not committing to any of the above prices and dealers please make your own decisions regarding the purchase, these links are just to give you an idea of what I'm using to make it work.

## [Getting Started](#getting-started)

Once your order with all of these parts arrived we can start by building the cluster.

### Build and prepare the hardware

Let's place each raspberry pi on the raspberry pi tower and ensure all screws are tighten.

![Raspberry pi tower](/img/posts/raspberry_pi_tower.jpeg 'Raspberry pi tower')

### Power supply

To messure our monthly energy costs we'll first connect the **Gifort Energy Cost Meter** to one of our socket in the house (near to our home router). Then we'll connect to the socket of the Cost Meter our **Intelinet Socket Strips**, that way we can messure the total cost / consumption of whatever we plug into these sockets.

After we have a base where we can plugin different sockets, we'll take the **AmazonBasics USB hubs** and supply them with electricity from our above mentioned setup, connect them to the sockets and place them near the **Raspberry pi acrylic tower**.

As a next step we'll prepare the cables for powering up the pi's, let's take the **USB type-A to type-C cables** and plug them into the USB slots where there is a small sign of battery near it, These our the only output that actually supplies electricity from our socket, the rest are just for connecting it to other devices (feels like waste to have so many USB inputs that do not supply power from the socket, but that's what I could find).

### Connectivity / Networking

Let's take our **NETGEAR 8 port network switch** and connect it to the router using one of our extra **cat 7 cable**, you can use any of the ports of the switch (you could use the first port for example) and plug it into one of the LAN entries of the home router. The switch should also be connected to the power supply so let's connect it to one of our available sockets and place the switch near the pi's, Now that our switch is connected to the home router, whatever we connect to our switch and after router portforwarding will be available to the public internet.

Let's connect all the pi's using **cat 7 cables** to our above mentioned switch. They are still not publicly available, we'll have to configure our home router, but I'll prefer to do this part at the end of the setup, once we have an stable internal cluster networking in place, we'll then direct traffic to our kubernetes ingress the traffic.

### Burn a Disk image

Let's install a light weight OS for raspberry, we'll download [Raspberry Buster Lite image](https://downloads.raspberrypi.org/raspbian_lite_latest) from the official [raspberrypi.org](https://raspberrypi.org/) website.

After download completed all we have to do is to install the OS image on our microSD cards using our home computer. There are plenty of tutorial about how to achieve that and it's different steps depending on the OS you are using at home, so I'm not going to go here into details, please feel free to checkout the official [documentation](https://www.raspberrypi.org/documentation/installation/installing-images/) on how to do that.

Now that we have on our microSD cards with bootable OS installed on them, we would want to add an empty file called **ssh** on the root directory of each microSD card, so ssh would be enabled by default when we bootstrap our pi's. We can now just connect all of the SD cards to the pi's.

### Setting up the pi's

After section **Power supply** is finished, we can now start all pi's one after the other, let's connect the **USB type-C cables** to our pi's and let them boot up. We'll need an **ssh client** installed on our home working station (our latptop / desktop), so we can connect to these pi's. Because my hostmachine OS is Windows what I normally like to do, is to create an **Ubuntu VM** with **Hyper-V**, but that's my personal preference, you can still use **PuTTy on windows**, but I do recommend you to have a unix distrubtion so we can control the kubernetes cluster in a consistent way from our working station (If your hostmachine is already one of the unix distrubtion out there feel free to forget whatever I've just mentions). For the sake of this tutorial I would assume your working station is Ubuntu.

First what I like to do is identify the pi's on my home router by names, rather than remembering ip address of each one, so let's go into our router configuration (normallly by going to the following web address in your favorite browser **http://192.168.1.1**). You could also figure all connected devices to your network by installing a commandline utility called **nmap** and run a simple command on your network internal ip range(often called **CIDR/Netmask**):

```sh
sudo apt-get install nmap
sudo nmap -sn 192.168.1.0/24
```

This command output should give you all Ip addresses connected to your network default interface, If you still can't determine which pi is which on which address, you could also disconnect all of them and connect them to power cable one after the other to figure out what pi get what ip address, later we'll also setup static ip's so even if we reboot them the pi's will remain with the same ip address.

From our working station let's copy our ssh public key to the authorized_keys on the remote pi's so we can access them (If you don't have an ssh key generated yet, you could do that on your working station using the following command ssh-keygen, do make sure you use passphrase), to copy the ssh pub key you could simply run:

```sh
ssh-copy-id pi@[first-pi-ip-address]
```

This will prompt you to enter a password, type **raspberry**, and your ssh public key should be copied over to the remote machine, now we can ssh this pi.

```sh
ssh pi@[first-pi-ip-address]
```

Okay we're now on the remote pi machine, first thing first let's update the packages run:

```sh
sudo apt-get update
```

Secondly let's disable password authentication on our ssh daemon configuration:

```sh
sudo vi /etc/ssh/sshd_config
```

look for **#PasswordAuthentication yes** uncomment this line and set it to no **PasswordAuthentication no** and save the configuration file. Finally restart the ssh dameon for the changes to take affect:

```sh
sudo systemctl restart sshd
```

That's it, it is now no longer possible to connect to this remote machine with password over ssh, this hardened the security a little bit.

Now that we have minimal security in place, what I normally like to do is give each machine an hostname so we can communicate with this machine not only by ip address rather than by a name that is easier to remember, let's run:

```sh
sudo raspi-config
```

You should be prompt with an terminal GUI, let's go to **Network Options > Hostname** and give this first pi a name, something like **k3s-master** would be ideal, you can however call it whatever is easier for you to recognize, give it a meaningful name as you would call the control plane node in kubernetes setup.

Same process we can repeat with the other 3 left pi's, the only different step would be the hostname, I normally give them names like **k3s-node1**, **k3s-node2** and **k3s-node3**

We are almost done with this part, let's configure static ip, to do that let's create a file **/etc/network/interfaces.d/k3s-master**:

```sh
interface eth0
static ip_address=192.168.1.6/24
static routers=192.168.1.1
static domain_name=192.168.1.1
```

Same goes for the other nodes the only thing that is changes and should be incremented is the ip_address part and the file name, so for example on **k3s-node1** we'll create a file on the same path called k3s-node1 with the following content:

```sh
interface eth0
static ip_address=192.168.1.7/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1
```

And so on... Before reboot let's also check our pi's **/boot/cmdline.txt** if it does not contain:

```sh
cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory
```

Make sure to add these to your pi.

When all done, we can reboot all the pi's, and ensure they still using the given ip address and not some random assigned.

Now we can also modify our /etc/hosts on the working station to something like:

```sh
192.168.1.6 k3s-master
192.168.1.7 k3s-node1
192.168.1.8 k3s-node2
192.168.1.9 k3s-node3
```

In addition what I like to do is to add an **~/ssh/config** file on my working station with the following content:

```sh
Host k3s-*
  User pi
  IdentityFile ~/.ssh/id_rsa
```

So it's easier to ssh to one of these machine when needed, instead of typing **ssh pi@k3s-node1** you could now just type **ssh k3s-node1** for example.

### Installing Kubernetes Control Plane

Now that we've our pi's ready and remotely accessible we can proceed with kubernetes installation, this is the easiest part of this entire tutorial, thanks to rancher project that made the installation process highly customizeable and fairly straightforward. On the **k3s-master** first install docker:

```sh
curl -sSL https://get.docker.com | -- sh
sudo usermod -aG docker $USER
docker info
```

Then we can proceed with installing k3s server (kubernetes control plane) with customized options:

```sh
curl -sSL https://get.k3s.io | INSTALL_K3S_EXEC='server --docker --no-deploy traefik' sh -
```

Explanation - we're running an installation script from rancher and configuring the server to use docker runtime instead of containerd, we also telling the installer to not deploy traefik as are ingress, I prefer to use nginx ingress instead.
After this is done, we should be able to connect to that cluster from **k3s-master** to verify it you can try:

```sh
sudo kubectl cluster-info
```

You should see similar output:

```sh
Kubernetes master is running at https://127.0.0.1:6443
CoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
Metrics-server is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy
```

We don't want to type sudo every time we want to access the cluster so let's copy the **kubernetes config file** over to our working station and place it in our **~/.kube/config**, to do that we first need to copy **/etc/rancher/k3s/k3s.yaml** to **~/.kube/config**:

```sh
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
```

Now exit the **k3s-master** and on the working station copy the kubernetes config file over:

```sh
scp pi@k3s-master:/home/pi/.kube/config /home/$USER/.kube/config
```

If we try now on our working station to run **kubectl cluster-info** we might see kubectl command not found, because we haven't installed it on our working station yet, we need to install this client:

```sh
curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
```

If we still try to run from our working station kubectl cluster-info we'll get a different error, connection error, this is because we need to modify our kubernetes configuration:

```sh
vi  ~/.kube/config
```

And replace **clusters[0].cluster.server** instead of **https://127.0.0.1:6443** to **https://k3s-master:6443** sense we no longer communicating the cluster from within the k3s-master, rather than we are communicating with this cluster remotely from our working station. Alright to verify our remote connection works as expected let's run:

```sh
kubectl cluster-info
```

We should now see the following output:

```sh
Kubernetes master is running at https://k3s-master:6443
CoreDNS is running at https://k3s-master:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
Metrics-server is running at https://k3s-master:6443/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy
```

We installed our control plane successfully if you see this output, we now need to install the **agents / worker nodes**. First let's verify that we have no worker nodes in our cluster:

```sh
kubectl get nodes
```

We should see a similar output:

```sh
NAME         STATUS   ROLES    AGE   VERSION
k3s-master   Ready    master   5m    v1.17.4+k3s1
```

What I normally like to do during the process of adding more worker nodes is to open a separate terminal session and watch them joining into the cluster, to do that run the following command:

```sh
watch kubectl get nodes
```

### Installing Kubernetes Worker Nodes

First let's install docker on all of the worker nodes:

```sh
for $nr in {1..3} \
do \
  ssh -t pi@k3s-node${nr} "curl -sSL https://get.docker.com | sh && sudo usermod -aG docker \$USER" \
done
```

Installing the agents is also pretty straightforward by issuing one liner command, but first we need to grab the api token from the **k3s-master**:

```sh
ssh -t k3s-master "sudo cat /var/lib/rancher/k3s/server/token"
```

Copy that **API token**, replace in the following command the value of **K3S_TOKEN** with that token and then run the following command on each worker node (**k3s-node1**, **k3s-node2** and **k3s-node3**), like so:

```sh
for $nr in {1..3} \
do \
  ssh -t pi@k3s-node${nr} "curl -sSL https://get.k3s.io | INSTALL_K3S_EXEC='agent --docker' K3S_URL='https://k3s-master:6443' K3S_TOKEN='[above-mentioned-api-token-string]' sh -" \
done
```

Now while this process is running you can inspect the other terminal session mentioned above and start to see how the node workers are joining into the cluster.

The final output should looks something similar to:

```sh
NAME         STATUS   ROLES    AGE   VERSION
k3s-master   Ready    master   10m   v1.17.4+k3s1
k3s-node1    Ready    -        3m    v1.17.4+k3s1
k3s-node2    Ready    -        2m    v1.17.4+k3s1
k3s-node3    Ready    -        1m    v1.17.4+k3s1
```

You probably figured there is a small issue here, **k3s-node1**, **k3s-node2** and **k3s-node3** does not have any ROLE assigned, this is a simple fix, just set their label with the following command:

```sh
for $nr in {1..3} \
do \
  kubectl label nodes/k3s-node${nr} node-role.kubernetes.io/worker=worker \
done
```

If you now inspect it again you would see:

```sh
NAME         STATUS   ROLES    AGE   VERSION
k3s-master   Ready    master   10m    v1.17.4+k3s1
k3s-node1    Ready    worker    3m    v1.17.4+k3s1
k3s-node2    Ready    worker    2m    v1.17.4+k3s1
k3s-node3    Ready    worker    1m    v1.17.4+k3s1
```

Ok so now we have a proper functioning cluster. If you recall previously we mentioned that we don't want to install traefik that is shipped with k3s by default, so the only missing part in our cluster is the nginx ingress, for deploying this we would use helm chart (Package manager of kubernetes).

First let's install helm 3 client on our working station:

```sh
curl -sSL https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | sh
```

Then let's add stable repo to the list of repos:

```sh
helm repo add stable https://kubernetes-charts.storage.googleapis.com
```

Lastly let's install the ingress in kube-system namespace and specify that we want to use the image for ARM architecture.

```sh
helm install nginx-ingress stable/nginx-ingress \
  --set controller.image.repository=quay.io/kubernetes-ingress-controller/nginx-ingress-controller-arm \
  --set controller.image.tag="0.30.0" \
  --set defaultBackend.image.repository=k8s.gcr.io/defaultbackend-arm \
  --set controller.publishService.enabled=true \
  --namespace kube-system
```

If we now inspect our services in the cluster, we should see a similar output(ip addresses and ports may vary):

```sh
NAMESPACE     NAME                            TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
default       kubernetes                      ClusterIP      10.43.0.1       <none>        443/TCP                      15m
kube-system   kube-dns                        ClusterIP      10.43.0.10      <none>        53/UDP,53/TCP,9153/TCP       15m
kube-system   metrics-server                  ClusterIP      10.43.19.77     <none>        443/TCP                      15m
kube-system   nginx-ingress-default-backend   ClusterIP      10.43.51.252    <none>        80/TCP                       1m
kube-system   nginx-ingress-controller        LoadBalancer   10.43.168.244   192.168.1.8   80:31445/TCP,443:31743/TCP   1m
```

Note we now have two new services, **nginx-ingress-default-backend** as internal **ClusterIP** and **nginx-ingress-controller** as **LoadBalancer**, the **Loadbalancer** receives the ip address of one of the **worker nodes** and uses that as the external ip where we could reach from outside of the cluster.

So we have a service of type Loadbalancer but that isn't enough for redirecting traffic on a larger scale, we need to deploy another kubernetes object called Ingress, which will redirect traffic based on DNS rules to internal services of type **ClusterIp**. let's deploy our Ingress kubernetes object:

```yaml
// ingress.yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: default
  namespace: kube-system
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  tls:
  - hosts:
    - www.my-awesome-site.com
    secretName: www.my-awesome-site.com-tls
  rules:
    - host: my-awesome-site.com
      http:
        paths:
        - path: /
          backend:
            serviceName: nginx-ingress-default-backend
            servicePort: 80
    - host: www.my-awesome-site.com
      http:
        paths:
        - path: /
          backend:
            serviceName: nginx-ingress-default-backend
            servicePort: 80
```

Note that here we specify that we want any traffic that hits our cluster external ip on **port 443** would be redirected to a backend service, in this case I've just specified that we want to redirect traffic to **nginx-ingress-default-backend** service on **port 80** if they ask our cluster with the following **www.my-awesome-site.com** or **my-awesome-site.com** hostname. You might wondering what's the tls section means, well there we only referencing our ssl certificate that we could get for free using cloudflare. We just need to create this secret kubernetes object before we apply this manifest. So let's quickly do that. Let's login into cloudflare and download our ssl keys (.key and .pem files). In cloudflare go to **SSL/TLS > Create Certificate** leave everything as default just specify the hostnames you want to request this certificate for **\*.my-awesome-site.com** and **my-awesome-site.com** once that is down you should be able to download the **.key** and **.pem** files, keep them somewhere safe. Now that we have these files let's import them as a secret in our cluster, run:

```sh
kubectl -n kube-system create secret tls my-awesome-site.com-tls --key path-to-key-file.key --cert path-to-pem-file.pem
```

Ok, so we now have our ssl certificate imported, let's apply the Ingress manifest mentioned above:

```sh
kubectl apply -f ingress.yaml
```

We're almost done, we just need to tell configure our home router and tell cloudflare to direct traffic to our public ip on port 80 and 443. In cloudflare let's go to **DNS > DNS management for my-awesome-site.com** and add 2 A records there:

| Type | Name                    | Content               | TTL  | Proxy Status |
| ---- | ----------------------- | --------------------- | ---- | ------------ |
| A    | my-awesome-site.com     | [your-public-ip-here] | Auto | Proxied      |
| A    | www.my-awesome-site.com | [your-public-ip-here] | Auto | Proxied      |

Note: to figure out what's the public ip address you got from your ISP you can simply call the following url: **https://ifconfig.me/ip**

We also need to add the nameservers of our domain provider(where we registered that domain), so in **Cloudflare > DNS > Cloudflare nameservers** let's enter the nameservers we got from our domain provider:

| Type | Value                        |
| ---- | ---------------------------- |
| NS   | some.ns.from.domain.provider |
| NS   | some.ns.from.domain.provider |

Ok so now all there is left to do is to configure port-forwarding on our home router, simply type the following address in your browser: http://192.168.1.1

Go to **Network** section and then look for **Port-Forwarding**, let's forward port 80 to X:80 and port 443 to X:443 where the **X** is the ip address of our cluster Ingress, we can figure out from our cluster, by issuing the following command:

```sh
kubectl get ingress -A
```

You should see one ingress object as the following:

```sh
NAMESPACE     NAME          HOSTS                                         ADDRESS       PORTS     AGE
kube-system   default       www.my-awesome-site.com,my-awesome-site.com   192.168.1.8   80, 443   25m
```

In the above mentioned output we know it's 192.168.1.8, let's use it in our home router. So portforward rules would be:

```sh
HTTP => 80 => 192.168.1.8:80
HTTPS => 443 => 192.168.1.8:443
```

We're done, if you now call your domain, you should see **default backend** output in the browser as https. As the example domain it would be **https://my-awesome-site.com**

We still have some issues with this cluster that we need to solve -

1. Our ISP would change our IP address after a period of time normally 24h and then our DNS in cloudflare would directing traffic to our outdated ip address.
2. Default backend page is not so exceiting, what if you want to deploy our own application.
3. Even if we'll make sure to update this ip address in cloudflare our users will experince downtime once the ISP changes the ip address.

We can solve only the first two issues as for the time of writing this article (as for the last one unfortunately there is no such thing as zero downtime when it comes to home made solutions, once a day after 24h when the ip has changed there might be 1 to 3 sec of downtime).

1. Luckly we can solve the first problem with the following technic, cloudflare-dns-updater util will allow us to check for ip changes, once our ip address as been changed by the ISP, this util will send an API call to cloudflare to update the given DNS records with our current public IP. The cool thing about it, is that we can deploy this to our cluster and forget it.
2. For deploying an application we need to build a container for ARM architecture, push it to a container image registry of choice, create a deployment and service manifest. For example first we create our namespace:

```sh
kubectl create ns backend
```

And **kubectl apply -f example-deployment-and-cluster-ip-service.yaml** the following deployment, assuming it's a container image that expose port 3000.

```yaml
// example-deployment-and-cluster-ip-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: backend
spec:
  replicas: 4
  selector:
    matchLabels:
      app: my-app
  strategy:
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: my-service
    spec:
      containers:
      - name: my-app
        image: my-registry/my-service:latest
        resources:
          requests:
            cpu: "200m"
            memory: "499Mi"
          limits:
            cpu: "200m"
            memory: "499Mi"
        ports:
        - containerPort: 3000
      terminationGracePeriodSeconds: 60
---
apiVersion: v1
kind: Service
metadata:
  name: my-app
  namespace: backend
spec:
  type: ClusterIP
  selector:
    app: my-app
  ports:
  - port: 8080
    targetPort: 3000
```

Lastly we would need to configure our Ingress object(previously mentioned) to point our DNS to this **my-app** service. sense the ingress and the application are not on the same namespace we would need to reference the serviceName in the following format **[service-name].[namespace]** so for example:

```yaml
// ingress.yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: default
  namespace: kube-system
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  tls:
  - hosts:
    - www.my-awesome-site.com
    secretName: my-awesome-site.com-tls
  rules:
    - host: my-awesome-site.com
      http:
        paths:
        - path: /
          backend:
            serviceName: my-app.backend
            servicePort: 8080
    - host: www.my-awesome-site.com
      http:
        paths:
        - path: /
          backend:
            serviceName: my-app.backend
            servicePort: 8080
```

Let's apply this configuration changes:

```sh
kubectl apply -f ingress.yaml
```

Now traffic to these hostnames would be directed to my-app backend service, open your Domain in the browser and verify it: https://my-awesome-site.com

I hope you enjoyed reading the article and that it level you up, and gave you a better understanding on how kubernetes manage to make our day to day development easier. If you liked this please give me feedback. On my next tutorial I would go into persistence storage and how to mount an SSD external storage as NFS to your cluster, so stay tuned.
