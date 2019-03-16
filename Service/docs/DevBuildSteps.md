# CareFlow-BCP-Solution
Business Continuity Solution for CareFlow Connect

*** Developer Notes ***

Assumptions:
Using version 8.11.4 of Node.js and npm 
    $ node -v **will show version**
    $ npm i npm@latest -g **will update npm**

Getting started:

1. Developed in a privte GitHub repo and clone locally using Bash
    $ git clone https://github.com/drjonshaw/CareFlow-BCP-Solution.git 
2. Created folder for the 'service' and forced a package.json file in this folder
    $ mkdir Service
    $ npm init -f ****
3. for linting during development
    $ npm install --save eslint
4. add the following into the Service package.json so that they run on npm start
    "scripts": {
        "start": "node ./src/app.js",
        "lint": "./node_modules/.bin/eslint **/*.js"
        },
5. create a source folder in the Service folder called 'src' and within it an 'app.js' file 
    $ npm start **Ctrl C to exit**
6. install axios and other dependencies to support http requests
    $ npm install --save axios
7. installs libraries to handle files & dates
    $ npm install --save fs-extra klaw moment
8. install dotenv globally to handle secure storage of credentials as environment variables when in local dev
    $ npm install dotenv  **install the vscode helper extension for this too**
    $ printenv **will show all current env variables on your machine**
    $ echo $BCP_USERNAME **will check to see if has already been set on server**
9. create git ignore file in root directory '.gitignore' (use vscode to do this) and add the following lines:
    "client/node_modules/
    server/node_modules/
    server/output/
    .env"
10. within the source folder, create folders for 'config' and 'controllers'
11. install handlebars for insertion of data into HTML templates
    $ npm install --save handlebars


# Managing Credentials
the credentials can be set in a '.env' file in the server app root directory but this doesn't have to be used in production (this file should be included in .gitignore. Use '.env.example' and rename to '.env' to set locally)
- Set the following values:
    - BCP_USERNAME=**your val**
    - BCP_PASSWORD=**your val**

Windows 10 and Windows 8
- System (Control Panel)
- Click the Advanced system settings link.
- Click Environment Variables. In the section System Variables, find the PATH environment variable and select it. Click Edit. If the PATH environment variable does not exist, click New.
- In the Edit System Variable (or New System Variable) window, specify the value of the PATH environment variable. Click OK. Close all remaining windows by clicking OK.
- Reopen Command prompt window

In Azure
- https://docs.microsoft.com/en-us/azure/app-service/web-sites-configure

More info
- https://medium.freecodecamp.org/heres-how-you-can-actually-use-node-environment-variables-8fdf98f53a0a
