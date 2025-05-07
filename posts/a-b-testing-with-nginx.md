---
title: 'A/B Testing with NGINX'
linkText: 'A/B Testing with NGINX'
description: 'A/B Testing with NGINX'
date: 'December 11 2021'
thumbnail: 'nginx.png'
image: 'nginx.png'
tags: 'testing'
excerpt: "Many companies don't release a newer version of their product to customers before they are 100% sure that the newer version with all of its features works properly"
draft: false
---

**A/B testing** is an essential part at the core of a business. Many companies don't release a newer version of their product to customers before they are 100% sure that the newer version with all of its features works properly. A working feature, from a business standpoint is a feature that converts well, whereas from a technical perspective, it's a feature that does not contain any bugs or errors.

Eventually both points of views lead to the same goal, which is improvement of the overall performance and having happy customers.

In this tutorial I want to explain how simple an **A/B test** could be using **[NGINX](https://en.wikipedia.org/wiki/Nginx)**.

I'll start from the basics and add further explanations down the road.

Let's suppose we have an application that has a simple **index.html** page:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Application</title>
  </head>
  <body>
    <style>
      .green {
        color: white;
        background: green;
        text-transform: uppercase;
      }
    </style>
    <button class="green">Add to Cart</button>
  </body>
</html>
```

I'll use basic **HTML5** structure, so it's easier for everyone to follow.
If we open this page in the browser we'll see a button with a text **ADD TO CART** in a green color.

![Green Button](/img/posts/ab_testing_button_green.png 'Green Button')

Now for some reason this button doesn't convert well enough and the UI/UX team decided they want to try a different color. Of course the developers could just change the color or maybe the UI/UX team can pass this task to the content team and they will log into some **Content Management System (CMS)** and change the color, but doing that affects all traffic.

What if the new color that they want to change for the button is not effective enough ? What if it even drops the conversion rate ? How can we test that ?

So the UI/UX team asked the developers, **"Hey, we would like to have this button in a blue color, but please try it first on 5% of the traffic!"**.

Alright, let's implement an **A/B test** for this button, we'll send only **5%** of the traffic and monitor how well the new color converts, after we're sure this button works better, we'll expose it to the rest of the customers.

Ok, so how can we achieve that ? given that we have the following NGINX **default.conf** configuration file:

```nginx
server {
    listen       80;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html;
    }
}
```

(I kept the above configuration very basic, NGINX creates a server that listens on port 80 bounded to localhost, when the user request / path, i.e **http://localhost:80/**, we serve the **index.html** from **/usr/share/nginx/html** path, i.e **/usr/share/nginx/html/index.html**).

But of course we need first a running NGINX web-server.

For the purpose of simplicity I'll use docker to run an NGINX web-server that uses the above configuration file (feel free to install NGINX however you like in order to follow along):

```sh
docker run --rm -it -v ${PWD}/html:/usr/share/nginx/html -v ${PWD}/conf.d:/etc/nginx/conf.d -p 80:80 nginx:alpine
```

My directory structure is as follows:

```sh
├── conf.d
│   └── default.conf
└── html
    └── index.html
```

Now that we have everything setup, let's go back to the button. How do we allow only 5% of the traffic to see the blue button like the UI/UX team originally requested ?

Well, we need to tweak the NGINX configuration a bit, since we're dealing here with simple HTML page, we'll use **[Server Side Includes (SSI)](https://en.wikipedia.org/wiki/Server_Side_Includes)** approach, where we replace only a certain part of the HTML for a specific group (i.e group A or B):

```nginx
split_clients "${remote_addr}V1" $appversion {
   95%  version_a;
   *    version_b;
}

server {
    ...
    location / {
        ssi on;
        set $group $appversion;
        ...
    }
}
```

Notice that I modified the NGINX configuration file a bit, I've **turned on SSI** in the **location block /** and I set a variable called **group** to whatever comes out from **split_clients** module.

**split_client** module decides to what group a particular client request belongs to based on the hashed value, in our case we use the IP address of the client since it's unique per client we can rely on it, but in general for the hash you could use any type of unique string.

Notice I also concatenate **V1** to the IP address string, this is often referred to as **[salt](<https://en.wikipedia.org/wiki/Salt_(cryptography)>)** for the hash, it's necessary in case we want to run a completely new experiment, when I change the **V1** to **V2** it will reshuffle the groups completely and ensure that we get a fresh new experiment.

**split_clients** ensures **95%** of the visitors will get **version_a** and **5% (which is the rest)** will get **version_b** and this value will be assigned to **appversion** variable.

That's it for the NGINX configuration, but how do we use it on the frontend ?

Let's tweak the frontend a bit:

```html
<!DOCTYPE html>
<html lang="en">
  ...
  <body>
    <style>
      .green {
        color: white;
        background: green;
        text-transform: uppercase;
      }
      .blue {
        color: white;
        background: blue;
        text-transform: uppercase;
      }
    </style>
    Group:
    <!--# echo var="group" -->
    <br />
    IP Address:
    <!--# echo var="remote_addr" -->
    <br />
    <!--# if expr="$group=/version_a/" -->
    <button class="green">Add to Cart</button>
    <!--# else -->
    <button class="blue">Add to Cart</button>
    <!--# endif -->
  </body>
</html>
```

All I did is adding a new CSS class as a **new style** for the new button, as the UI/UX team requested it to be blue and then with an if check we're checking for a match of the group if it's **version_a** we'll show the green button, otherwise we'll show the blue one. I also added some debugging information, like **group** and **IP address** so we can understand what's happening.

Let's rerun the nginx web-server (`Ctrl+C` to exit out of the previous nginx container):

```sh
docker run --rm -it -v ${PWD}/html:/usr/share/nginx/html -v ${PWD}/conf.d:/etc/nginx/conf.d -p 80:80 nginx:alpine
```

Ok, after restarting you should be able now to see either the blue or the green button based on the group nginx assigned your ip to and that's the gist of it.

If you're curious what happens under the hood, how does NGINX make all of the "magic" happen, the **[implementation](https://github.com/nginx/nginx/blob/master/src/core/ngx_murmurhash.c)** NGINX is using is an algorithm called **[murmur_hash2](https://en.wikipedia.org/wiki/MurmurHash)**.

**SSI** is a good use-case when you just want to replace small chunks / segments of the **UI** on the **same application**.

However, the **split_client** module isn't just for that particular use-case, it's possible to also use it in the context of entirely different upstream applications.

Let's take the previous example request from the UI/UX team and now instead of replacing just the button, they want to run another experiment, a new application that was developed by another team. They want to check which application converts better.

They shared with us that url of the new application, http://localhost:3000, now of course this is all made up, let's tweak the nginx configuration to make that happen:

```nginx
split_clients "${remote_addr}V1" $appversion {
   50%  application_a;
   *    application_b;
}

upstream application_a {
    server 127.0.0.1:8080;
}

upstream application_b {
    server 127.0.0.1:3000;
}

server {
    listen       80;
    server_name  localhost;

    location / {
        proxy_pass http://$appversion;
    }
}

server {
    listen       8080;
    server_name  application_a;

    location / {
        root   /usr/share/nginx/html;
        index  index.html;
    }
}

server {
    listen       3000;
    server_name  application_b;

    location / {
        root   /usr/share/nginx/html;
        index  index2.html;
    }
}
```

I'll explain what I've changed here. Instead of 1x server block we now have 3x server blocks, the very top one is the one that passes the client requests using **proxy_pass** module to the downstream applications (i.e application_a and application_b).
For demonstration purposes I've just created another **index2.html** file, which will resemble the other new application that listens on port 3000.
At the top you can see we have two upstreams, one for each application.
split_client was slightly changed, for readability purposes instead of returning **version_a** or **version_b** I called it **application_a** or **application_b**.
Since UI/UX would like to know which application performs better, we need a fair 1 to 1 comparison, I'll split the traffic by 50% 50%.

That's it for the nginx configurations.

Now what about the frontend ? what have I changed there, **index.html** now looks pretty simple, without custom if checks:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Application A</title>
  </head>
  <body>
    This is Application A
  </body>
</html>
```

For demonstrating purposes I duplicated the above file and called it **index2.html** that has the title **"Application B"** with the body **"This is Application B"**.

Let's rerun the nginx web-server (`Ctrl+C` to exit out of the nginx container):

```sh
docker run --rm -it -v ${PWD}/html:/usr/share/nginx/html -v ${PWD}/conf.d:/etc/nginx/conf.d -p 80:80 nginx:alpine
```

Now based on your client IP address there is **50% chance** that you get either Application **A** or **B**.

The **split_clients** module is great, but are there any alternative ways of achieving similar results ?

Of course there are, consider the above mentioned example. Let's say we have two different applications that are represented by different **index.html** files.
We can also use server **weight**, on a single upstream to tell NGINX what **weight** of the visitors (imagine buckets of clients) an upstream server should get out of the total weight available in the upstream block.

Consider the following nginx configuration, in particularly **3rd part** from the left in the upstream **a_b_testing**:

```nginx
upstream a_b_testing {
    server 127.0.0.1:8080 weight=50;
    server 127.0.0.1:3000 weight=50;
}

server {
    listen       80;
    server_name  localhost;

    location / {
        proxy_pass http://a_b_testing;
    }
}

server {
    listen       8080;
    server_name  application_a;

    location / {
        root   /usr/share/nginx/html;
        index  index.html;
    }
}

server {
    listen       3000;
    server_name  application_b;

    location / {
        root   /usr/share/nginx/html;
        index  index2.html;
    }
}
```

This might looks a bit simpler, it's another way of running an A/B test in NGINX, notice the weight, I gave 50 weight to the first upstream server, and 50 weight to the second upstream server, what nginx would do is calculate the total weight on that block, and sense 50 + 50 is equal 100, these values will be considered in percentage.

Give it a try, notice that when you run this, and refresh the browser, something unexpected is happening, you will be bounced from **Application A** to **Application B** on each browser refresh.

Why is it happening ?

Well we just told NGINX the percentage we want each application to be prioritized, but what we didn't tell NGINX is based on what criteria we want to split it, by default NGINX is using **[round-robin](https://en.wikipedia.org/wiki/Round-robin_DNS)** technique that sends the clients to the list of servers that is supplied inside of the upstream block, one after the other. Of course this does not fit our intended use-case, so we can change that **default behavior**, let's use also the **IP address** of the client, since it's unique for each visitor. We can use the directive **ip_hash** inside of the upstream block in order to achieve that, and if you run the test again, you will notice that once you hit one of the applications, you stay on each browser refresh on that same application.

Just modify the configurations a bit as follows:

```nginx
upstream a_b_testing {
    ip_hash;
    server 127.0.0.1:8080 weight=50;
    server 127.0.0.1:3000 weight=50;
}
...
```

## Conclusion

What did we learn ?

A/B testing is great for maintaining a great customer's experience.
It's very straightforward to run an A/B test with NGINX using **split_client** module.

With the **split_client** module we can either split the traffic between two entirely different applications or within the same application by replacing **HTML parts** of the application using **SSI**.

Depending how simple your use-case is, you could run an A/B test using NGINX **weight** flag, if you set an upstream server to 20 and the other one to 80, it will be considered in percentage, that means that one app will receive 20% of the traffic and the other one will receive 80%. Caution - it's important to use **ip_hash** directive, to let NGINX know that the weight of the upstream servers will be considered by the hash string made from the client's IP address, to ensure **[sticky sessions](https://wiki.genexus.com/commwiki/servlet/wiki?45282,Server+Affinity+%28Sticky+Sessions%29)** for each unique visitor, this will ensure these clients will receive the same server / app the next time they visit.

We learned the fundamentals of how an A/B test in NGINX works, if you understand this, it will be fairly simple to understand how this works on Kubernetes - I'll create a tutorial for this too. Kubernetes only abstract some of the core concepts here and make it a bit simpler to deploy.

Additionally, you can see how **split_client** module isn't just good for **A/B testing**, rather it is also good for **[Canary deployments](https://en.wikipedia.org/wiki/Feature_toggle)**, where you want to shift a smaller portion of the traffic just to verify the new version of the application truly works before you shift the entire traffic, to minimize the damage.

(For simplicity and readability purposes I didn't include flags like proxy timeouts etc, note that those are necessary for the production environment and you don't want to rely on nginx default configurations, so make sure you research about the proper value before applying those configurations to production).
