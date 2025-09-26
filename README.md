# payment-api
Payment API Rest

## Installation

```bash
npm install
```

## Enviroment

```bash
ren env-example .env
```

## Docker

```bash
docker-compose -p payment -f "docker-composer.yml" up postgres -d --build
```

## Prisma

```bash
npx prisma generate
```

```bash
npx prisma migrate dev --name init
```

## Data Exploration

```bash
npx prisma studio
```

## Tests

```bash
npm run test
```

```bash
npm run test:cov
```

## Running the app

```bash
# development
$ npm run start

# development with watch mode
$ npm run start:payment:dev

# production mode
$ npm run start:payment:prod
```

## Swagger

(<http://localhost:5000/payment/api/v1/swagger>)
