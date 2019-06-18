# Building image

    docker-compose build

# Running container

    docker-compose up

# Attaching to container

    docker-compose exec app bash

# Remotely connecting to container

Container allows remote SSH connections for authorized keys (see `ssh/authorized_keys`).

If your key is authorized, connect as follows:

    ssh root@<ip> -p 8022
