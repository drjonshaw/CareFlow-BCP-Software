
# Axios

http://codeheaven.io/how-to-use-axios-as-your-http-client/ 

**Axios response schema**
axios.get('/user/12345')
  .then(function(response) {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
  });

**Axios Setting Headers**
var config = {
  headers: {'X-My-Custom-Header': 'Header-Value', 'API-Key': 'FF99FF99-FF99-FF99-FF99-FF99FF99FF99'}
};

axios.get('https://api.github.com/users/codeheaven-io', config);
axios.post('/save', { firstName: 'Marlon' }, config);

# Nodemon
"start": "nodemon ./src/app.js --config nodemon.json"
- create a nodemon.json file to prevent a loop when creating files
{
    "verbose": false,
    "ignore": ["output/*"]
  }

# Git
# commit
0. $ cd - **to get to root dir if working in service dir**
1. $ git add --all
2. $ git commit -m "your changes"
3. $ git push

# Git commands
1. $ ls
2. $ cd - **go back**
3. $ cd.. **move up dir**
4. $ cd somefoldername **3 letters then tab**
5. $ mdir 
6. $ rmdir

# pull
2. $ git pull

# updating node libraries
1. cd service
2. npm audit

# Async / Await

