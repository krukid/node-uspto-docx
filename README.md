# node-uspto-docx

## Understanding program environment

This CLI program is written for Node.js runtime and uses NPM for dependency management.
Target OS is Linux, but the program can also be run on Windows via Docker.

Software recommendations and requirements:

1. [Git](https://git-scm.com/download/win) - Recommended to sync code with Github repository via CLI
2. [Visual Studio Code](https://code.visualstudio.com/) - Recommended as a code editor
3. [Docker](https://download.docker.com/win/stable/InstallDocker.msi) - Required to set up a virtual environment on Windows OS

If you only need to run the program without any code changes, then you only need Docker and program code. The latter can be downloaded via WWW without git client.

## Cloning the program repository

Clone git repo:

    git clone https://github.com/krukid/node-uspto-docx.git

Note that for Windows OS it's recommended to clone via HTTPS, because we'll then be able to cache credentials via credential helper:

    git config --global credential.helper wincred

## Setting up program environment (Windows)

First, make sure the drive the program is located on is shared with Docker (see Docker settings). Then, build and mount Docker container (see also: [scripts/README.md](scripts/win/README.md)):

    scripts/build.ps1 uspto
    scripts/mount.ps1 uspto

## Configuring the program

You will need to create two files in application root directory before running the program:

1. `.env` with appropriate environment variables
2. `config.json` with program settings

### .env file example

    SEARCH=index.domain.com
    DOMAIN=details.domain.com
    SLACK=api.slack.com?token=...

### config.json

    {
        "queries": [
            {
                "searchCode": "...",
                "templateName": "X_tmpl.docx",
                "addYears": {
                    "renewalDate": 20,
                    "filingDate": 0,
                    "dateInLocation": 0,
                    "regDate": 0
                }
            },
            ...
        ]
    }

## Running the program

NOTE: for consistent state, run from within a container on Linux also.

    npm start

## Viewing results

Results are placed into `output` folder.
