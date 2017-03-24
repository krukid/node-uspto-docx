# node-uspto-docx

## Installing program dependencies

This program is written for Node.js runtime and uses NPM for dependency management.
Target OS is Linux, but the program can also be run on Windows via Docker.

Software recommendations and requirements:

1. [Git](https://git-scm.com/download/win) - Recommended to sync code with Github repository via CLI
2. [Visual Studio Code](https://code.visualstudio.com/) - Recommended as a code editor
3. [Docker](https://download.docker.com/win/stable/InstallDocker.msi) - Required to set up a virtual environment on Windows OS

## Setting up the program (Windows)

First, make sure the drive the program is located on is shared with Docker (see Docker settings). Then, build and mount Docker container (see also: [scripts/README.md](scripts/README.md)):

    scripts/build.ps1
    scripts/mount.ps1

## Running the program

    npm install
    npm start

## Viewing results

Results are placed into `output` folder.

## Developing (Windows)

Clone git repo:

    git clone https://github.com/krukid/node-uspto-docx.git

Note that it's recommended to clone via HTTPS, because it allows us to cache credentials via credential helper:

    git config --global credential.helper wincred

