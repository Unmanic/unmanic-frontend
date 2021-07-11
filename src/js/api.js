let $unmanicApiUrl;
/**
 * unmanicApiUrl
 *
 * Build the Unmanic backend API URI.
 * This is stored in the '$unmanicApiUrl' GLOBAL
 *  for any future calls to this function.
 *
 * @returns {string}
 */
export const unmanicApiUrl = function () {
  if ($unmanicApiUrl === undefined) {
    var parser = document.createElement('a');
    parser.href = window.location.href;

    $unmanicApiUrl = parser.protocol + '//' + parser.host + '/api';
  }

  return $unmanicApiUrl;
};

/**
 * UnmanicApi
 *
 * Fetch data from Unmanic's API
 *
 * @type {{get: (function(*, *): *)}}
 */
export const UnmanicApi = (function () {
  let logApiErrors = function (errors, log_header) {
    log_header = typeof log_header !== 'undefined' ? log_header : false;
    if (errors) {
      if (log_header) {
        console.error(log_header);
      }
      for (let i = 0; i < errors.length; i++) {
        console.error(errors[i]);
      }
    }
  };

  let errorCallback = function (returnPromise, url, jqXHR) {
    let payload = {};
    try {
      // Decode the API returned JSON object
      payload = JSON.parse(jqXHR.responseText);
      logApiErrors(
        payload.errors,
        "Unmanic API Request failed. See below for error from Unmanic backend ('" + url + "')"
      );
    } catch (e) {
      // If the API did not return JSON, long an error and return
      logApiErrors(
        [jqXHR.responseText],
        "Unmanic API Request failed. See below for error from Unmanic backend ('" + url + "')"
      );
    }
    returnPromise.reject('ERROR: Error from Unmanic backend.');
    return returnPromise.promise();
  };

  let timeoutCallback = function (returnPromise, url) {
    logApiErrors([], "Unmanic API Request failed. Request timed out ('" + url + "')");
    returnPromise.reject('ERROR: Request timed out.');
    return returnPromise.promise();
  };

  let successCallback = function (returnPromise, url, data, textStatus, jqXHR) {
    let payload = {};
    try {
      // Decode the API returned JSON object
      payload = JSON.parse(jqXHR.responseText);
    } catch (e) {
      // If the API did not return JSON, long an error and return
      logApiErrors([jqXHR.responseText], "Unmanic API Request failed. Unable to parse JSON response. - '" + url + "'");
      returnPromise.reject('ERROR: Unable to parse JSON response.');
      return returnPromise.promise();
    }
    // Return the data from JSON payload
    return returnPromise.resolve(payload);
  };

  return {
    get: function (api_version, api_endpoint) {
      let returnPromise = new jQuery.Deferred();
      let url = unmanicApiUrl() + '/' + api_version + '/' + api_endpoint;

      jQuery.ajax({
        url: url,
        method: 'GET',
        statusCode: {
          200: function (data, textStatus, jqXHR) {
            successCallback(returnPromise, url, data, textStatus, jqXHR);
          },
          400: function (jqXHR, textStatus, errorThrown) {
            errorCallback(returnPromise, url, jqXHR, textStatus, errorThrown);
          },
          404: function (jqXHR, textStatus, errorThrown) {
            errorCallback(returnPromise, url, jqXHR, textStatus, errorThrown);
          },
          500: function (jqXHR, textStatus, errorThrown) {
            errorCallback(returnPromise, url, jqXHR, textStatus, errorThrown);
          },
          504: function (jqXHR, textStatus, errorThrown) {
            timeoutCallback(returnPromise, url, jqXHR, textStatus, errorThrown);
          },
        },
      });
      return returnPromise.promise();
    },
  };
})();
