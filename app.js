const yargs = require('yargs');
const axios = require('axios');
const request = require('request');
const GitHubApi = require('node-github');
const express = require('express');
const hbs = require('hbs');

const port = process.env.PORT || 3000;

const argv = yargs
  .options({
    u: {
      demand: false,
      alias: 'user',
      describe: 'User\'s name',
      string: true
    },
    r: {
      demand:  false,
      alias: 'repo',
      describe: 'repository name',
      string: true
    },
    s: {
      demand: false,
      alias: 'status',
      describe: 'status of issues',
      string: true
    }
  })
  .help()
  .alias('help', 'h')
  .argv;

var username = argv.user || 'd3';
var repo = argv.repo || 'd3';
var status = argv.status || 'closed';
var avatar_url;
var gitApiUrl = `https://api.github.com/repos/${username}/${repo}/issues\?state\=${status}`

// console.log(argv);
console.log({
  username,
  repo,
  status,
  gitApiUrl
});

var app = express();

app.set('view-engine', 'hbs');

app.use(express.static(__dirname + '/public'));

var github = new GitHubApi({
    version: "3.0.0"
});

var userList = [];

// github.authenticate({
//     type: "basic",
//     username: "debayan3007",
//     password: '9540287d8f1b6f66d88a0cd5fd0d393a935e006d'
// });
// curl -H "Authorization: 9540287d8f1b6f66d88a0cd5fd0d393a935e006d OAUTH-TOKEN" https://api.github.com

// user token
github.authenticate({
    type: "token",
    username: "debayan3007",
    token: "9540287d8f1b6f66d88a0cd5fd0d393a935e006d",
});

// github.user.getFollowingFromUser({
//     user: "d3"
// }, function(err, res) {
//     console.log(res);
// });

// github.issues.getAssignees({
//   owner: 'd3',
//   repo: 'd3'
// }, function (err, res) {
//   console.log(res);
// });

axios.get(gitApiUrl).then((response) => {
  userList  = (response.data.map((elem) => {
    return {
      user: elem.user.login,
      followers_url: elem.user.followers_url,
      avatar_url: elem.user.avatar_url
    };
  }));
  // console.log(userList.map(elem => axios.get(elem.followers_url)));
  // console.log(userList);


  axios.get(`https://api.github.com/users/${username}`).then((response) => {
    avatar_url = response.data.avatar_url;
    console.log(avatar_url);
  }).catch((e) => {
    console.log(e.message);
  });

  
  axios.all(userList.map(elem => axios.get(elem.followers_url)))
    .then(axios.spread((...args) => {
      for (var i in args) {
        userList[i].followers = args[i].data.length;
      }
      return userList;
    })).then((user) => {
      var userDisp = '';
      for (var i in userList) {
        userDisp += userList[i].user + '(' + userList[i].followers + ')' + '<br/>'
      }
      app.get('/', (req, res) => {
        res.send('<p>/' + username + '/' + repo + '/</p><p>'+ userList.length +'</p><img src="'+avatar_url+' alt="'+avatar_url+'" height="80" width="80"><p innerHTML=' + userDisp + '></p>');
      });
    }).catch((e) => {
      console.log(e.message);
    });
}).catch((e) => {
  // if (e.code === 'ENOTFOUND') {
  //   console.log('Unable to connect to API servers.');
  // } else {

    app.get('/', (req, res) => {
        res.render('home.hbs', {
            repo: '/d3/d3/',
            count: null,
            users: null
          });
        });
    console.log(e.message);
  // }
});
app.listen(port);
