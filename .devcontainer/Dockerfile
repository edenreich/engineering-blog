FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bullseye

RUN apt-get update && apt-get install -y zsh git curl

RUN chsh -s $(which zsh)

RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git /home/node/.oh-my-zsh/custom/themes/powerlevel10k

RUN ln -sf /home/node/.oh-my-zsh/custom/themes/powerlevel10k/powerlevel10k.zsh-theme /home/node/.oh-my-zsh/custom/themes/codespaces.zsh-theme

RUN sed -i 's/ZSH_THEME="devcontainers"/ZSH_THEME="powerlevel10k\/powerlevel10k"/g' /home/node/.zshrc

COPY .devcontainer/p10k.zsh /home/node/.p10k.zsh

RUN echo '[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh' >> /home/node/.zshrc
