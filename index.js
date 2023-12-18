const axios = require("axios");
const { URLSearchParams } = require("url");
const { handleResponse, handleError } = require("./handlers.js");


/**
 * @param {string} url
 * @param {object} data
 * @param {object} headers
 * @param {object} body
 * @param {number} timeout
 * @param {number} speed Requests per second. Required for some apis with limited payload.
 * @param {function} onSuccess Optional function to handle raw axios response
 * @param {function} onError Optional function to handle raw axios error
 * @returns {{html(): Promise<*>, json(): Promise<*>, binary(): Promise<*>}}
 */
function _get(url, data, { headers = {}, body, timeout = 30000, speed, onSuccess = handleResponse, onError = handleError } = {}) {
    let config = { url, headers, timeout, method: 'GET' };

    if (typeof data === 'object' && Object.keys(data).length) {
        config.params = data;
    }
    if (typeof body === 'object' && Object.keys(body).length) {
        config.data = body;
        config.headers['Content-Type'] = 'application/json';
    }

    return {
        async html() {
            config.responseType = 'html';
            config.headers.Accept = 'text/html';

            return await axios.request(config).then(onSuccess).catch(onError);
        },

        async json() {
            config.responseType = 'json';
            config.headers.Accept = 'application/json';

            const [ response ] = await Promise.all([
                axios.request(config).then(onSuccess).catch(onError),
                // Add delay if necessary
                speed && new Promise(resolve => setTimeout(resolve, 1000 / speed)),
            ]);

            return response;
        },

        async binary() {
            config.responseType = 'arraybuffer';
            config.reponseEncoding = 'binary';

            return await axios.request(config).then(onSuccess).catch(onError);
        },
    };
}



/**
 * @param {string} url
 * @param {object|URLSearchParams} data
 * @param {object} headers
 * @param {number} timeout connection timeout
 * @param {number} speed Requests per second. Required for some apis with limited payload.
 * @param {function} onSuccess Optional function to handle raw axios response
 * @param {function} onError Optional function to handle raw axios error
 * @return {{json(): Promise<*>}}
 */
function _post(url, data, { headers = {}, timeout = 30000, speed, onSuccess = handleResponse, onError = handleError } = {}) {
    let config = { url, headers, timeout, method: 'POST' };

    if (data instanceof URLSearchParams) {
        config.data = data.toString();

    } else if (typeof data === 'object' && Object.keys(data).length) {
        config.data = data;
    }

    return {
        async json() {
            config.responseType = 'json';
            config.headers.Accept = 'application/json';

            const [ response ] = await Promise.all([
                axios.request(config).then(onSuccess).catch(onError),
                // Add delay if necessary
                speed && new Promise(resolve => setTimeout(resolve, 1000 / speed)),
            ]);

            return response;
        },
    };
}


/**
 * @param {string} url
 * @param {object} data
 * @param {object} headers
 * @param {number} timeout connection timeout
 * @param {function} onSuccess Optional function to handle raw axios response
 * @param {function} onError Optional function to handle raw axios error
 * @returns {{json(): Promise<*>}}
 */
function _delete(url, data, { headers = {}, timeout = 30000, onSuccess = handleResponse, onError = handleError }) {
    let config = { url, headers, timeout, method: 'DELETE' };

    if (typeof data === 'object' && Object.keys(data).length) {
        config.data = data;
    }

    return {
        async json() {
            config.responseType = 'json';
            config.headers.Accept = 'application/json';

            return await axios.request(config).then(onSuccess).catch(onError);
        },
    }
}


async function test() {
    let request = _post('https://httpbin.org/anything', {
        param: 'value',
    }, {
        headers: { Authorization: 'my-token' },
    });

    return await request.json();
}


module.exports = { get: _get, post: _post, delete: _delete, test };
