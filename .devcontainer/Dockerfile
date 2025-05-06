FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bullseye

RUN apt-get update && apt-get install -y zsh git curl

# Install Powerlevel10k theme
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git /home/node/.powerlevel10k
RUN echo 'source /home/node/.powerlevel10k/powerlevel10k.zsh-theme' >> /home/node/.zshrc
RUN echo 'POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD=true' >> /home/node/.zshrc

RUN chsh -s $(which zsh) node

RUN npm install -g npm@11.3.0
