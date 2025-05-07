FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bullseye

ENV GITHUB_CLI_VERSION=2.68.1

RUN apt-get update && apt-get install -y zsh git curl

# Install Github CLI
RUN curl -fsSL https://github.com/cli/cli/releases/download/v${GITHUB_CLI_VERSION}/gh_${GITHUB_CLI_VERSION}_linux_$(dpkg --print-architecture).tar.gz -o /tmp/gh_${GITHUB_CLI_VERSION}_linux_$(dpkg --print-architecture).tar.gz && \
tar -xzf /tmp/gh_${GITHUB_CLI_VERSION}_linux_$(dpkg --print-architecture).tar.gz -C /tmp && \
chmod +x /tmp/gh_${GITHUB_CLI_VERSION}_linux_$(dpkg --print-architecture)/bin/gh && \
mv /tmp/gh_${GITHUB_CLI_VERSION}_linux_$(dpkg --print-architecture)/bin/gh /usr/local/bin/gh

# Install Powerlevel10k theme
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git /home/node/.powerlevel10k
RUN echo 'source /home/node/.powerlevel10k/powerlevel10k.zsh-theme' >> /home/node/.zshrc
RUN echo 'POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD=true' >> /home/node/.zshrc

RUN chsh -s $(which zsh) node

RUN npm install -g npm@11.3.0

RUN echo 'source <(gh completion -s zsh)' >> /home/node/.zshrc
