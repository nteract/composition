[![▲ Now Deployed](https://img.shields.io/badge/%E2%96%B2%20now-deployed-777777.svg)](https://commuter-now-otvkncbefl.now.sh/view/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# com·mut·er

> /kəˈmyo͞odər/
> a person who travels some distance to work on a regular basis.

As commuters, we rush around from place to place all day. We go to work,
school, and stores. We travel to locations near and far. Eventually, we
return to our cozy home. :car: :office: :airplane: :tokyo_tower: :bullettrain_side: :department_store: :bus: :school: :bike: :city_sunset: :runner: :house_with_garden:

Like commuters, our data travels around too. Sometimes we need a notebook at
work and other times at a client's site. Wherever and whenever you need your
notebooks, **commuter** has you covered.

## What is "commuter"?

As an opinionated [nteract](https://nteract.io) focused server, **commuter**
reads notebooks from a local directory or Amazon S3, has a directory explorer to find notebooks,
and provides a jupyter compatible version of the contents API. You determine
where your notebooks should reside and where they should be shared. Flexibility
and convenience.

![commuter](https://cloud.githubusercontent.com/assets/836375/23089382/e330effa-f53c-11e6-85d0-7561ccdbe163.gif)

Try **commuter** today and take your notebooks wherever you need them.

[Demo](https://commuter-now-otvkncbefl.now.sh/view/)

## Installation

```
npm install @nteract/commuter -g
```

## Usage

Configure and run commuter with environment variables and `commuter server`.

Example local run (using a network file share!):

```sh
COMMUTER_LOCAL_STORAGE_BASEDIRECTORY=/efs/users/ commuter
```

Example S3 run:

```sh
COMMUTER_BUCKET=sweet-notebooks commuter
```

## Environment Variables

### General Environment Variables

| Environment Variable                   | Description                              | Default         |
| -------------------------------------- | :--------------------------------------- | :-------------- |
| `COMMUTER_STORAGE_BACKEND`             | `local` or `s3`                          | `local`         |
| `COMMUTER_DISCOVERY_BACKEND`           | either elasticsearch or none             | `"none"`        |
| `COMMUTER_PORT`                        | Port to run commuter on                  | 4000            |
| `COMMUTER_LOCAL_STORAGE_BASEDIRECTORY` | directory to serve in local storage mode | `process.cwd()` |
| `COMMUTER_ES_HOST`                     | ElasticSearch Host                       | `""`            |

### Environment Variables for S3 Storage

| Environment Variable         | Description                                     | Default                                                    |
| ---------------------------- | :---------------------------------------------- | :--------------------------------------------------------- |
| `COMMUTER_S3_BASE_PREFIX`    | prefix on the bucket, similar to base directory | `""`                                                       |
| `COMMUTER_S3_PATH_DELIMITER` | separator for "paths"                           | `"/"`                                                      |
| `COMMUTER_BUCKET`            | bucket contents served from                     | Required in S3 mode, no default                            |
| `COMMUTER_S3_KEY`            | AWS Key                                         | Optional, uses IAM roles or `~/.aws/credentials` otherwise |
| `COMMUTER_S3_SECRET`         | AWS Secret                                      | Optional, uses IAM roles or `~/.aws/credentials` otherwise |

## Roadmap

[ROADMAP Document](./ROADMAP.md)

## Development

#### Quick Start

1. `git clone git@github.com:nteract/nteract.git`
1. `cd nteract`
1. `npm i`
1. `npm run app:commuter`
1. open `http://localhost:4000`

## Tests

1. `npm t`

## Deployment

1. Install commuter cli `npm install @nteract/commuter`
1. `exec commuter` - the service is typically wrapped inside [daemontools](https://cr.yp.to/daemontools.html)
