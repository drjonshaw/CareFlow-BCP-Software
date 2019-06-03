
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
1. $ git add --all
2. $ git commit -m "your changes"
3. $ git push
then
1. $ git pull

# Async / Await

