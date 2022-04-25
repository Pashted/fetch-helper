const fetch = require('./index');

(async () => {
    let response = await fetch.test();
    console.log(response);
})();