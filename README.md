# Pokemon Data Twitch Bot

This bot reads data from the [PokeApi Graphql](https://pokeapi.co/docs/graphql) and responds to Twitch messages with them.

If you want this to run in your twitch channel, send me a message on my [discord server](https://discord.gg/6AjaSkr).

![image](https://user-images.githubusercontent.com/19432855/201597482-ffe4e471-23ed-46bb-bb31-266dcc00d0fc.png)

## Install

1. Install [node.js](https://nodejs.org/en/download/), [yarn](https://yarnpkg.com/getting-started/install) (or use npm).
2. Clone this repository, and using a terminal navigate to its directory.
3. Run `yarn` or `npm install` to install the dependencies.

## Build & Run

1. Copy the contents of the `.env.example` file to a `.env` next to it, and edit it with your values.
2. Follow [this twuorple guide](https://twurple.js.org/docs/examples/chat/basic-bot.html) from Twitch bot auth.
   - The token json file should be placed in `./tokens/token-CLIENTID.json`.
3. Run `yarn build` or `npm build` to build the files.
4. Run `yarn start` or `npm start` to start the application.

-   You can run `yarn dev` or `npm dev` to combine the 2 steps above, while listening to changes and restarting automatically.

## Run with Docker

1. Build:

    ```
    docker build -t my-app .
    ```

    Replacing `my-app` with the image name.

2. Run
    ```
    docker run -d -p 3000:3000 my-app
    ```
    Replacing `my-app` with the image name, and `3000:3000` with the `host:container` ports to publish.

## Developing

### Visual Studio Code

-   Installing the Eslint (`dbaeumer.vscode-eslint`) and Prettier - Code formatter (`esbenp.prettier-vscode`) extensions is recommended.

## Linting & Formatting

-   Run `yarn lint` or `npm lint` to lint the code.
-   Run `yarn format` or `npm format` to format the code.

## Testing

Check the placeholder test examples to get started : 

- `/src/app.ts` that provide a function `sum` 
- `/test/app.spec.ts` who test the `sum` function 

This files are just an example, feel free to remove it

-   Run `yarn test` or `npm test` to execute all tests.
-   Run `yarn test:watch` or `npm test:watch` to run tests in watch (loop) mode.
-   Run `yarn test:coverage` or `npm test:coverage` to see the tests coverage report.
