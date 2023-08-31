/**
 * Default handler of raw axios response
 * @param {object} res Axios response object
 * @returns {*}
 */
function handleResponse(res) {
    const response = res.data;

    if (res.config?.responseType === 'json' && typeof response !== 'object') {
        let err = new Error('Invalid JSON');
        err.response = res;

        if (typeof response === 'string') {
            // Explain error with first and last letters of body response
            let exampleLength = 200;
            err.reason = response.slice(0, exampleLength);

            if (response.length > exampleLength * 2)
                err.reason += `<...> ${response.slice(exampleLength * -1)} [${response.length}]`;

            else if (response.length > err.reason.length)
                err.reason += response.slice(exampleLength);
        }

        throw err;
    }

    // Sometimes apis return errors with 200 status code - handle such errors here
    const errorMessage = response?.errorText || response?.error_description || (response?.error && response?.message) || response?.error?.message;
    if (errorMessage) {
        let err = new Error('Response error');
        err.reason = errorMessage;
        throw err;
    }

    return response;
}


/**
 * Default handler of raw axios error
 * @param {object} err Axios error object
 * @returns {*}
 */
function handleError(err) {
    let errorMessage = err.message,
        reason = err.reason
            || err.response?.data?.message
            || err.response?.data?.description
            || err.response?.data?.error_description
            || err.response?.statusText
            || err.code;

    if (reason)
        errorMessage += ` (${reason})`;

    // Recreate error object to drop axios errors and build actual callstack
    let error = new Error(errorMessage);
    error.code = err.response?.status || err.code;
    throw error;
}


module.exports = { handleResponse, handleError };
