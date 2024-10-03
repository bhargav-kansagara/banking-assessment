# banking-assessment
## Run locally in dev mode
### Prerequisit
- Node (https://github.com/nvm-sh/nvm/blob/master/README.md)
- Docker Desktop for running awslocal (https://www.docker.com/products/docker-desktop/)

### Steps to run service locally
- Run `docker run --rm -it -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack` to initiate aws local environment
- Run `npm i` from "banking-assessment" directory from another terminal
- Run `npm run dev` to run the server

### Run concurrency test
- Run `node .\test\concurrency.cjs` from "banking-assessment" directory from another terminal to execute the concurrency test which will log request initiation, their completion time and final balance.