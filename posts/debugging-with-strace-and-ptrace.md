---
title: 'Debugging running processes with strace and ptrace'
date: 'November 27 2021'
thumbnail: 'linux_logo_thumbnail.png'
tags: 'linux, tracing'
excerpt: 'In this article I want to explain / summarize how light weight and yet powerful tools like strace and ptrace are...'
draft: false
---

In this article I want to explain / summarize how light weight and yet powerful tools like [**strace**](https://man7.org/linux/man-pages/man1/strace.1.html) and [**ptrace**](https://man7.org/linux/man-pages/man2/ptrace.2.html) are.

The first time I started using those tools were when I was trying to figure out what an application is actually doing, it may also happened to you or perhaps few of the following scenarios:

- You received a code that someone else wrote(probably a few years back) and now you have to maintain it and sense you didn't write it, you can't really tell what the application is actually doing by just looking at the code(because the code is written in a very complex way and the person that written this code is no longer available for questions)
- You accessed a machine that hasn't been touched for years, and you have to troubleshot a running process to understand why this application is so slow, that process was deployed onto this machine by someone, somehow, and you don't have access to that code
- You are using a framework, that does a bunch of things under the hood, but you can't really figure out why is it so slow

If you came across one of the following above mentioned scenarios, then strace and ptrace are probably your best bet.
Before I dive deeper on how to use these tools I think first it's important to understand what each tool basically does.
Both tools are prefixed with a letter, this letter has a meaning.

- strace - the first letter stands for System-Calls, meaning this tool is for tracing what calls a particular process is sending to the linux kernel.
- ptrace - the first letter stands for Process-Calls, meaning this tool is for tracing what calls a particular process is sending to a linux kernel. But in addition it allows a tracer(=the process which running ptrace) to mutate the traceree(=the process which is being examined).

The great thing about using strace and ptrace, is that they are language agnostic(meaning you can strace and ptrace a program written in almost any language javascript, php, rust, go etc, as long as it's a unix program and it's running, we can simply attach to it and trace it to get the low level kernel operations). Although there are some high level diagnostic tools for each specific language, that makes it a bit more structural and easier to understand for that particular language, I still think it's a good practice to get a rough overview about what the program is doing first, before diving into implementation details, and I think strace does a great job at providing that information.

First we need an example program that we can verify the results, so let's say we have a running application written in NodeJS, we'll start to reverse engineer the system calls which are issued by this program, so let's create it:

```sh
mkdir demo
cd demo
```

Let's create a simple hello world index.js file:

```javascript
setInterval(() => {
  console.log('Hello World!');
}, 1000);
```

Above code would console log out "Hello World!" every 1000 millisecond which is every second.

Ok on the first terminal let's start this simple program, and let it run for a while:

```sh
node index.js
```

Let's start to dive deeper into strace, I won't go through all options here, because there are many of them but I'll try to explain what works best for me when troubleshooting a bug.
There is a lot of information that is not needed in order to debug an issue so I'll use few filters and explain them afterward.

On another terminal session, let's execute and explore the following command:

```sh
PID=`pgrep node | tail -n1`
strace -f -T -p $PID
```

`pgrep node | tail -n1` resolves to the process id of the script we ran earlier, same as if you were running `ps -ef` and lookup for that process id of the command:

```sh
/usr/bin/node index.js
```

Note the **-f** flag that was added, this will ensure the tracing is done for every forked child processes(if there are any) by this main process, without this flag we're not able to see what a child processes are doing.

Note the **-T** flag that was added, this will provide us the time spent on a system call. You could also change it to **-t** which will show you the current time when this operation got executed or **-r** that will provide us the relative elapsed time for each system operation(with -r you normally need to look on the previous system calls to figure out slow operations, therefore I much prefer to use **-T**).

Now the output should be similar to the following:

```sh
[pid  5882] epoll_wait(13, [], 1024, 999) = 0 <1.000285>
[pid  5882] write(17, "Hello World!\n", 13) = 13 <0.000453>
[pid  5882] epoll_wait(13, [], 1024, 0) = 0 <0.000215>
```

Your output should be similar as the above mentioned, the process id number on the left side and the time spent on the right side may be different.
It's also easy to identify on first sight the **Hello World!** string followed by a line-break, in addition it's possible to see that the system call [**write**](https://man7.org/linux/man-pages/man2/write.2.html) (if you're familiar with C the signature the function signature is: `ssize_t write(int fd, const void *buf, size_t count);`) is issued to the linux kernel. **write** accepts 3 arguments, the first argument is the [file descriptor](https://en.wikipedia.org/wiki/File_descriptor) which is reserved by the linux kernel for this particular process, the second one is our string and lastly the third argument is the amount of bytes this function writes, i.e 13 chars = 13 bytes and finally it returns how many bytes have been written(i.e **= 13** section).

Ok, so we can identify the write operation, but what is this **epoll_wait** all about ?
Well, [**epoll_wait**](https://man7.org/linux/man-pages/man2/epoll_wait.2.html) (in it's full function signature in C: `int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);`) is the system call that was produced by `setInterval(function, ms);` which we defined on **index.js**, It's waiting for an event on that epoll file descriptor or until this is timing out in milliseconds(i.e in the above mentioned output the third argument **999** milliseconds). If there was an error it returns -1 or 0 if no file descriptor became ready during the requested timeout in milliseconds.

Alright so it's possible to understand what's an high level written program like NodeJS is doing on the operation system to the kernel without even knowing about the content of index.js !?
All we needed is strace and the pid of that application. Of course, in a real case scenario a program contains more details and it maybe more verbose than just an "Hello World" that is outputted to the console. I just wanted to share with you the process of debugging.
If I don't know something about this particular low level function I always read the man pages (i.e `man strace` or `man syscalls` will open the manual with all the necessary information you need to know about this particular function).

Ok, that's covers strace usage "in a nutshell", ptrace let you do the same things, the only different is that ptrace a dependency of strace and many other debuggers out there, actually if not most of the debuggers exiting out there (i.e gdb, dbx etc.), there is also a tool called ltrace which is another layer of debugging, it let you intercept calls made by the application to C libraries, but I won't go over these in this post, because you can get almost all information necessary to troubleshoot a bug by using just strace.

## Bonus Tip

Another useful thing is at first to get a brief overview of all system calls and their counts sent to the kernel by using flag **-c**

```sh
strace -c -f -p $PID
```

Run `Ctrl+C` to interrupt this command after a few seconds and you should see a similar output:

```sh
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 63.12    0.000936          52        18           epoll_wait
 36.88    0.000547          60         9           write
------ ----------- ----------- --------- --------- ----------------
100.00    0.001483                    27           total
```

Alright, all of these calls are actually non-failing commands, but what if we want to only be focused on the errors that this program may produce, it could be useful isn't it ?
By adding **-Z** flag we can find all failing system calls let's try it:

```sh
strace -Z -f -p $PID
```

Of course, there is nothing outputted because there is no error in the script. Let's modify the **index.js** and produce an error:

```javascript
const fs = require('fs');

setInterval(() => {
  console.log('Hello World!');
  try {
    fs.readFileSync('non-existing-file.txt');
  } catch {}
}, 1000);
```

In the above example I imported file system module and tried to read a file that does not exists on the disk. By putting a try catch block around this operation I simply ignore the exception and I do not provide any information when it fails.
Well this code is obviously badly written, without error feedback or anything that let you know when something went wrong, but on legacy systems such things may still exists, and it's perfect for this example. It will produce a system call error, let's verify it using the **-Z** flag I mentioned earlier:

```sh
strace -Z -f -p $PID
```

Now we can see the suppressed error by the program, but it is still visible for us, you should see a similar output:

```sh
[pid 11620] openat(AT_FDCWD, "non-existing-file.txt", O_RDONLY|O_CLOEXEC) = -1 ENOENT (No such file or directory)
```

As you can see [**openat**](https://linux.die.net/man/2/openat) kernel function was called and it was failing to read a file, because that file does not exist.

A program may do a lot of things, a program can call an external API by issuing an HTTP request over the network, a program may write to the disk or read out from it (i.e I/O), a program may allocate a bunch of things into the memory and perhaps use CPU intensively. All of those are traceable with this simple util.

There are many other filters you may apply to an strace, for this you can use the **-e** flag followed with a value like **trace=network**, here is a list of filter we can use:

- -e trace=ipc – Track communication between processes (IPC)
- -e trace=memory – Track memory syscalls (like brk, mmap, mmap2 etc)
- -e trace=network – Track network syscalls (like sock, accept, accept4 etc)
- -e trace=process – Track process calls (like fork, exec etc)
- -e trace=signal – Track process signal handling (like HUP, exit)
- -e trace=file – Track file related syscalls

This will allow us to filter out the output to find relevant information about that particular application. For example if we know the issue relay on slow interaction of that application with external API's then we might look for network calls and measure the time it took for each network call to execute by adding flag **-T**:

```sh
strace -T -e trace=network -f -p $PID
```

## Conclusions

We learned how strace can help for inspecting what's going on a running process. A process that you may or may not have a source code for it but you still need somehow to figure out what is failing and how to fix it. Those tools are very easy to install and does not require any complicated setup, they are there sense 1992! and they are language agnostic (with one exception: if it's for debugging high level programs). Depending on the language that the process is running the system calls may be different, but in most cases they are the same regardless of what language is being used, I've chosen NodeJS because I thought it would be easier to understand for the most of us, but feel free to try it with other dynamically typed languages, you'll see that you get similar results.

If you liked this post and you still have some questions, feel free to throw your questions at me and I'll make sure to cover them on another post.
