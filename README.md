# Circuit Breaker Backend POC

## :bulb: Overview

The idea is to make a POC around a BE that expose some APIs and internally communicate with a Postgres DB and logs everything happen under the hood

## :nut_and_bolt: How-to

The project is a simple BE with some APIs exposed to read and create `Post` inside a Postgres database.

In order to start using it we need to create a testing environment with Docker running the command `docker compose up -d`. The command setup a **Postgres** database exposing the port `5432` and a **PgAdmin** exposing the port `8080` (for user and password see `docker-compose.yaml`).

Created the environment we can start the project in this way:

1. create `.env` file into root folder of the project and copy/past this value `DATABASE_URL="postgresql://user:secret@localhost:5432/app?schema=public"`
2. ensure the **Node** version is the same of the file `.nvmrc`
3. install all the dependencies with `npm i`
4. import database schema with `npx prisma migrate dev --name init`
5. import dummy data with `npm run seed`
6. now you can start the server with `npm run dev`

If everything went well, now we can perform some requests:

### :hammer: Fetch all Posts

```
curl --location 'http://127.0.0.1:3000/api/v1/posts' \
    --header 'Content-Type: application/json'
```

### :hammer: Create a Post

```
curl --location 'http://127.0.0.1:3000/api/v1/posts' \
    --header 'Content-Type: application/json' \
    --data '{
        "title": "My First Post",
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque eget ipsum nunc. Donec aliquam mauris magna, ut hendrerit elit mattis vel. Donec et magna at est auctor auctor. Suspendisse sed pharetra est, feugiat pharetra elit. Integer non dui ultrices, accumsan arcu et, viverra quam. Quisque elementum massa mauris, eu consequat nulla euismod in. Integer auctor lorem eget mauris molestie sodales. Etiam finibus tincidunt turpis, sed sollicitudin tortor convallis euismod. Duis pretium a sem eu dapibus. Cras ornare arcu nec mollis consequat. Aenean ullamcorper, massa non mollis auctor, mi turpis auctor est, eget malesuada dui massa nec lacus."
    }'
```

### :monkey_face: Warning Notes

Unfortunately during the development of this code my domestic chimps is escaped, and you know, monkeys sometime can do crazy things!!!

## :pencil2: Refereces

- [Vite + Express](https://github.com/szymmis/vite-express)
- [NVM](https://github.com/nvm-sh/nvm)
- [Docker desktop](https://www.docker.com/products/docker-desktop/)
- [Circuit breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Opossum circuit breaker](https://github.com/nodeshift/opossum)
