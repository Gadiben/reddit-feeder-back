# reddit-feeder-back

## To run
First, install dependencies:

```bash
npm install
```

Then run the server:
```bash
node ./index.js
```
It should start the server at port 4000

Open [http://localhost:4000/graphql](http://localhost:4000/graphql) to query with graphql

## Techno
NodeJs Server with apollo for graphql and PostgreSQL as database management system.

To initialize the database, run:
```bash
node ./postgres-node/migrations.js
```
