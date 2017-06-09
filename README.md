# node-uspto-docx
# @deprecated

## Understanding program environment

This CLI program is written for Node.js runtime and uses NPM for dependency management.
Target OS is Linux, but the program can also be run on Windows via Docker.

Software recommendations and requirements:

1. [Git](https://git-scm.com/download/win) - Recommended to sync code with Github repository via CLI
2. [Visual Studio Code](https://code.visualstudio.com/) - Recommended as a code editor
3. [Docker](https://download.docker.com/win/stable/InstallDocker.msi) - Required to set up a virtual environment on Windows OS

## Cloning the program repository

Clone git repo:

    git clone https://github.com/krukid/node-uspto-docx.git

Note that for Windows OS it's recommended to clone via HTTPS, because we'll then be able to cache credentials via credential helper:

    git config --global credential.helper wincred

## Setting up program environment (Windows)

First, make sure the drive the program is located on is shared with Docker (see Docker settings). Then, build and mount Docker container (see also: [scripts/README.md](scripts/README.md)):

    scripts/build.ps1 uspto
    scripts/mount.ps1 uspto

## Running the program

NOTE: for consistent state, run from within a container on Linux also.

    npm install
    npm start

## Viewing results

Results are placed into `output` folder.
