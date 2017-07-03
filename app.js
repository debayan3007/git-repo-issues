const yargs = require('yargs');
const axios = require('axios');

var userList = [];
// const argv = yargs.argv;
// console.log(argv);

axios.get('https://api.github.com/repos/d3/d3/issues\?state\=closed').then((response) => {
  console.log(Object.keys(response));
  userList  = (response.data.map((elem) => {
    return {
    	user: elem.user.login,
      followers: elem.user.followers_url
    };
  }));
  // console.log(userList.map(elem => axios.get(elem.followers)));
  // console.log(userList);
  axios.all(userList.map(elem => axios.get(elem.followers)))
    .then(axios.spread((...args) => {
      for (var i in args) {
        console.log(args[i].data.length);
      }
    })).catch((e) => {
      console.log(e.message);
    });
})
.catch((e) => {
  // if (e.code === 'ENOTFOUND') {
  //   console.log('Unable to connect to API servers.');
  // } else {
    console.log(e.message);
  // }
});

// axios.all(userList.map((elem) => axios.get(elem.followers)))
//   .then(axios.spread(function (...arg) {
//     // Both requests are now complete
//     for(var i in arg) {
//       console.log(arg.data);
//     }
// }));
