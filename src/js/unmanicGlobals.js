import axios from "axios";

let $unmanic = {};

export const getUnmanicApiUrl = function (api_version, api_endpoint) {
  if (typeof $unmanic.apiUrl === 'undefined') {
    let parser = document.createElement('a');
    parser.href = window.location.href;

    $unmanic.apiUrl = parser.protocol + '//' + parser.host + '/api';
  }
  return $unmanic.apiUrl + '/' + api_version + '/' + api_endpoint;
}

export default {
  getUnmanicVersion() {
    return new Promise((resolve, reject) => {
      if (typeof $unmanic.version === 'undefined') {
        axios({
          method: 'get',
          url: getUnmanicApiUrl('v2', 'version/read')
        }).then((response) => {
          $unmanic.version = response.data.version;
          resolve($unmanic.version)
        })
      } else {
        resolve($unmanic.version);
      }
    })
  },
  getUnmanicSession() {
    return new Promise((resolve, reject) => {
      if (typeof $unmanic.session === 'undefined') {
        axios({
          method: 'get',
          url: getUnmanicApiUrl('v2', 'session/state')
        }).then((response) => {
          $unmanic.session = {
            created: response.data.created,
            email: response.data.email,
            level: response.data.level,
            name: response.data.name,
            picture_uri: response.data.picture_uri,
            uuid: response.data.uuid,
          }
          resolve($unmanic.session)
        }).catch(() => {
          reject()
        })
      } else {
        resolve($unmanic.session);
      }
    })
  }
}
