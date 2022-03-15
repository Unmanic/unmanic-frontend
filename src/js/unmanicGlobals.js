import axios from "axios";
import { Notify, setCssVar } from 'quasar'

let $unmanic = {};

export const getUnmanicServerUrl = function () {
  if (typeof $unmanic.serverUrl === 'undefined') {
    let parser = document.createElement('a');
    parser.href = window.location.href;

    $unmanic.serverUrl = parser.protocol + '//' + parser.host;
  }
  return $unmanic.serverUrl;
}

export const getUnmanicApiUrl = function (api_version, api_endpoint) {
  if (typeof $unmanic.apiUrl === 'undefined') {
    let serverUrl = getUnmanicServerUrl();

    $unmanic.apiUrl = serverUrl + '/unmanic/api';
  }
  return $unmanic.apiUrl + '/' + api_version + '/' + api_endpoint;
}

export const setTheme = function (mode) {
  if (mode === 'dark') {
    setCssVar('primary', '#009fdd');
    setCssVar('secondary', '#002e5c');
    setCssVar('warning', '#b5902a');
    document.body.style.setProperty('--q-card-head', '#212121');
  } else {
    setCssVar('primary', '#002e5c');
    setCssVar('secondary', '#009fdd');
    setCssVar('warning', '#f2c037');
    document.body.style.setProperty('--q-card-head', '#f5f5f5');
  }
}

export default {
  $unmanic,
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
  },
  getUnmanicPrivacyPolicy() {
    return new Promise((resolve, reject) => {
      $unmanic.docs = (typeof $unmanic.docs === 'undefined') ? {} : $unmanic.docs
      if (typeof $unmanic.docs.privacypolicy === 'undefined') {
        axios({
          method: 'get',
          url: getUnmanicApiUrl('v2', 'docs/privacypolicy')
        }).then((response) => {
          $unmanic.docs.privacypolicy = response.data.content.join('')
          resolve($unmanic.docs.privacypolicy)
        }).catch(() => {
          reject()
        })
      } else {
        resolve($unmanic.docs.privacypolicy);
      }
    })
  },
  login(login_data) {
    // Set the action URL
    let action = login_data.data.url;
    // Set the UUID
    let uuid = login_data.uuid;
    // Set the current URI
    let currentUri = window.location.origin + "/unmanic/ui/trigger/?session=reload";

    let form = '' +
      '<form id="loginForm" action="' + action + '" method="post" class="display:none;">' +
      '<input type="hidden" name="uuid" value="' + uuid + '" />' +
      '<input type="hidden" name="current_uri" value="' + currentUri + '" />' +
      '</form>';

    // Create form under body
    document.body.innerHTML += form
    // Submit the form
    document.getElementById("loginForm").submit();
  },
  loginWithPatreon($t) {
    axios({
      method: 'get',
      url: getUnmanicApiUrl('v1', 'session/unmanic-patreon-login-url'),
    }).then((response) => {
      if (response.data.success) {
        // If query was successful...
        this.login(response.data);
      } else {
        // Our query was unsuccessful
        console.error('An error occurred while fetching the patreon sponsor page.');
      }
    }).catch(() => {
      Notify.create({
        color: 'negative',
        position: 'top',
        message: $t('notifications.failedToFetchLoginUrl'),
        icon: 'report_problem',
        actions: [{ icon: 'close', color: 'white' }]
      });
    })
  },
  loginWithGitHub($t) {
    axios({
      method: 'get',
      url: getUnmanicApiUrl('v1', 'session/unmanic-github-login-url'),
    }).then((response) => {
      if (response.data.success) {
        // If query was successful...
        this.login(response.data);
      } else {
        // Our query was unsuccessful
        console.error('An error occurred while fetching the github sso page.');
      }
    }).catch(() => {
      Notify.create({
        color: 'negative',
        position: 'top',
        message: $t('notifications.failedToFetchLoginUrl'),
        icon: 'report_problem',
        actions: [{ icon: 'close', color: 'white' }]
      });
    })
  },
  loginWithDiscord($t) {
    axios({
      method: 'get',
      url: getUnmanicApiUrl('v1', 'session/unmanic-discord-login-url'),
    }).then((response) => {
      if (response.data.success) {
        // If query was successful...
        this.login(response.data);
      } else {
        // Our query was unsuccessful
        console.error('An error occurred while fetching the discord sso page.');
      }
    }).catch(() => {
      Notify.create({
        color: 'negative',
        position: 'top',
        message: $t('notifications.failedToFetchLoginUrl'),
        icon: 'report_problem',
        actions: [{ icon: 'close', color: 'white' }]
      });
    })
  },
  logout($t) {
    // TODO: Create v2 API endpoint
    axios({
      method: 'get',
      url: getUnmanicApiUrl('v1', 'session/unmanic-sign-out-url'),
    }).then((response) => {
      if (response.data.success) {
        // If query was successful...
        // Set the action URL
        let action = response.data.data.url;
        // Set the UUID
        let uuid = response.data.uuid;
        // Set the current URI
        let currentUri = window.location.origin + "/unmanic/ui/trigger/?session=reload";

        let form = '' +
          '<form id="loginForm" action="' + action + '" method="post" class="display:none;">' +
          '<input type="hidden" name="uuid" value="' + uuid + '" />' +
          '<input type="hidden" name="current_uri" value="' + currentUri + '" />' +
          '</form>';

        // Create form under body
        document.body.innerHTML += form
        // Submit the form
        document.getElementById("loginForm").submit();
      } else {
        // Our query was unsuccessful
        console.error('An error occurred while fetching the patreon sponsor page.');
      }
    }).catch(() => {
      Notify.create({
        color: 'negative',
        position: 'top',
        message: $t('notifications.failedToFetchLogoutUrl'),
        icon: 'report_problem',
        actions: [{ icon: 'close', color: 'white' }]
      });
    })
  },
  sponsorProject($t) {
    // TODO: Create v2 API endpoint
    axios({
      method: 'get',
      url: getUnmanicApiUrl('v1', 'session/unmanic-patreon-page'),
    }).then((response) => {
      if (response.data.success) {
        // If query was successful...
        // Open the Patreon sponsor page in a new tab
        let win = window.open(response.data.data.sponsor_page, '_blank');
        if (win) {
          //Browser has allowed it to be opened
          win.focus();
        } else {
          //Browser has blocked it
          Notify.create({
            color: 'negative',
            position: 'top',
            message: $t('notifications.allowPopups'),
            icon: 'report_problem',
            actions: [{ icon: 'close', color: 'white' }]
          });
        }
      } else {
        // Our query was unsuccessful
        console.error('An error occurred while fetching the patreon sponsor page.');
      }
    }).catch(() => {
      Notify.create({
        color: 'negative',
        position: 'top',
        message: $t('notifications.failedToFetchLoginUrl'),
        icon: 'report_problem',
        actions: [{ icon: 'close', color: 'white' }]
      });
    })
  },
}
