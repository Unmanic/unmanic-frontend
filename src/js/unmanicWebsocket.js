import { Notify } from 'quasar'
import $unmanic from './unmanicGlobals'

/**
 * Function for handle default WS connection to the Unmanic service.
 * This will return a WS instance which can be expanded upon with
 * additional requests depending on the page's requirements.
 *
 * @param $t
 * @returns {{init: (function(): *), close: close}}
 * @constructor
 */
export const UnmanicWebsocketHandler = function ($t) {
  let clearConnectionWarning = null;
  let autoReconnectSocket = true;
  let connectionTimer = null;
  let serverId = null;

  /**
   * Init the websocket to the unmanic backend server
   *
   * @returns {null|WebSocket|*}
   */
  const initWebsocket = function () {

    function showWebsocketConnectionWarning() {
      // Ensure the websocket is actually missing
      if (typeof $unmanic.ws !== 'undefined' && $unmanic.ws !== null) {
        return;
      }
      if (clearConnectionWarning === null) {
        console.debug("Display websocket disconnect warning")
        clearConnectionWarning = Notify.create({
          timeout: 0,
          spinner: true,
          color: 'warning',
          position: 'top',
          message: $t('notifications.backendConnectionWarning'),
          icon: 'report_problem'
        });
        let connectionCheckInterval = setInterval(() => {
          if (typeof $unmanic.ws !== 'undefined' && $unmanic.ws !== null) {
            if ($unmanic.ws.readyState === WebSocket.OPEN) {
              console.log("Websocket has reconnected. Clearing warning.")
              clearConnectionWarning();
              clearConnectionWarning = null;
              clearInterval(connectionCheckInterval);
            }
          }
        }, 500);
      }
    }

    function openWS() {
      if (typeof $unmanic.ws === 'undefined' || $unmanic.ws === null) {
        // Build WS path
        let loc = window.location,
          new_uri;
        if (loc.protocol === 'https:') {
          new_uri = 'wss:';
        } else {
          new_uri = 'ws:';
        }
        new_uri += '//' + loc.host + '/unmanic/websocket';

        // Open WS connection
        $unmanic.ws = new WebSocket(new_uri);
      }
    }

    function reconnectWS() {
      // Set ws as null so that it needs to be recreated
      $unmanic.ws = null;
      // Empty all websocket event listeners
      $unmanic.websocketEventListeners = {};
      connectionTimer = setTimeout(() => {
        console.debug('Attempting reconnect to Unmanic server...');
        initWebsocket();
      }, 4000);
    }

    function dismissMessages(message_id) {
      if (typeof $unmanic.frontendMessage === 'undefined') {
        return
      }
      if (typeof $unmanic.frontendMessage[message_id] === 'function') {
        $unmanic.frontendMessage[message_id]();
        if (typeof $unmanic.ws !== 'undefined' && $unmanic.ws !== null) {
          $unmanic.ws.send(JSON.stringify({ command: 'dismiss_message', params: { message_id: message_id } }));
        }
      }
      if (typeof $unmanic.frontendMessage[message_id] !== 'undefined') {
        delete $unmanic.frontendMessage[message_id]
      }
    }

    function displayStatus($t, message_id, type, code, message, timeout) {
      // Create new status message
      // Fetch message string from i18n
      let notificationStringId = 'notifications.serverMessages.' + code
      let notificationString = $t(notificationStringId)
      // If i18n doesnt have this string ID, then revert to default
      if (notificationString === notificationStringId) {
        notificationString = $t('notifications.serverMessages.defaults.' + type);
      }
      // If the message is not empty, concatenate it to the end of the notification string
      if (message) {
        notificationString = notificationString + '<br>' + message;
      } else {
        // Check if a preset message is available
        let messageStringId = 'notifications.serverMessages.' + code + 'Message'
        let messageString = $t(messageStringId)
        // If i18n doesnt have this string ID, then revert to default
        if (messageString !== messageStringId) {
          message = $t('notifications.serverMessages.' + code + 'Message');
          // Concatenate it to the end
          notificationString = notificationString + '<br>' + message;
        }
      }

      notificationString = '' +
        '<span style="display:block;min-height:50px;white-space:pre;">' +
        notificationString +
        '</span>'

      let icon = 'announcement';

      if (!(message_id in $unmanic.frontendMessage)) {
        $unmanic.frontendMessage[message_id] = Notify.create({
          group: false,
          type: 'ongoing',
          position: 'bottom-left',
          message: notificationString,
          html: true,
        })
      } else {
        // Update the current status message
        $unmanic.frontendMessage[message_id]({
          message: notificationString,
          html: true,
        })
      }
    }

    function displayNotice($t, message_id, type, code, message, timeout) {
      if (!(message_id in $unmanic.frontendMessage)) {
        // Fetch message string from i18n
        let notificationStringId = 'notifications.serverMessages.' + code
        let notificationString = $t(notificationStringId)
        // If i18n doesnt have this string ID, then revert to default
        if (notificationString === notificationStringId) {
          notificationString = $t('notifications.serverMessages.defaults.' + type);
        }
        // If the message is not empty, concatenate it to the end of the notification string
        if (message) {
          notificationString = notificationString + ' - ' + message;
        }

        // Format notification based on message type
        let color = 'info';
        let icon = 'announcement';
        if (type === 'error') {
          color = 'negative';
          icon = 'error';
        } else if (type === 'warning') {
          color = 'warning';
          icon = 'warning';
        } else if (type === 'success') {
          color = 'positive';
          icon = 'thumb_up';
        }

        $unmanic.frontendMessage[message_id] = Notify.create({
          timeout: timeout,
          color: color,
          position: 'bottom-right',
          message: notificationString,
          icon: icon,
          actions: [
            {
              icon: 'close',
              color: 'white',
              handler: () => {
                dismissMessages(message_id);
              }
            }
          ]
        })
      }
    }

    function displayMessages(data) {
      if (typeof $unmanic.frontendMessage === 'undefined') {
        $unmanic.frontendMessage = {};
      }
      let current_ids = []
      for (let i = 0; i < data.length; i++) {
        let message_id = data[i].id
        let type = data[i].type
        let code = data[i].code
        let message = data[i].message
        let timeout = data[i].timeout
        if (type === 'status') {
          displayStatus($t, message_id, type, code, message, timeout);
        } else {
          displayNotice($t, message_id, type, code, message, timeout);
        }
        current_ids[current_ids.length] = message_id
      }
      for (let message_id in $unmanic.frontendMessage) {
        if (!(current_ids.includes(message_id))) {
          dismissMessages(message_id);
        }
      }
    }

    // Ensure the websocket is open
    if (typeof $unmanic.ws === 'undefined' || $unmanic.ws === null) {
      console.debug("Starting connection to websocket server")
      // Open WS connection
      openWS();

      // Add event listener to request frontend messages from server
      addWebsocketEventListener('open', 'start_frontend_messages', function (evt) {
        clearTimeout(connectionTimer);
        $unmanic.ws.send(JSON.stringify({ command: 'start_frontend_messages', params: {} }));
      });

      // Add event listener to handle frontend messages from server
      addWebsocketEventListener('message', 'handle_frontend_messages', function (evt) {
        if (typeof evt.data === 'string') {
          let jsonData = JSON.parse(evt.data);
          if (jsonData.success) {
            // Ensure the server is still running the same instance...
            if (serverId === null) {
              serverId = jsonData.server_id;
            } else {
              if (jsonData.server_id !== serverId) {
                // Reload the whole page. Some things may have changed
                console.debug('Unmanic server has restarted. Reloading page...');
                location.reload();
              }
            }
            // Parse data type and update the dashboard
            switch (jsonData.type) {
              case 'frontend_message':
                displayMessages(jsonData.data);
                break;
            }
          } else {
            console.error('WebSocket Error: Received contained errors - ', evt.data);
          }
        } else {
          console.error('WebSocket Error: Received data was not a string - ', evt.data);
        }
      });

      // Add event listener to handle an error in the websocket
      addWebsocketEventListener('error', 'websocket_error', function (evt) {
        console.error('WebSocket Error: ', evt);
        // Set a timeout before displaying disconnect warning.
        // Sometimes we get a disconnect just from a slow connection.
        setTimeout(() => {
          // Display error
          showWebsocketConnectionWarning();
        }, 5000);
      });

      // Add event listener to auto-reconnect the websocket if the socket closes
      addWebsocketEventListener('close', 'websocket_close', function (evt) {
        if (autoReconnectSocket) {
          reconnectWS();
        }
      });
    }

    return $unmanic.ws;
  }

  /**
   * Add an event listener to the websocket.
   * This allows us to ensure that event listeners are not duplicated.
   *
   * @param type
   * @param key
   * @param callback
   */
  const addWebsocketEventListener = function (type, key, callback) {
    if (typeof $unmanic.ws !== 'undefined' && $unmanic.ws !== null) {
      if (typeof $unmanic.websocketEventListeners === 'undefined') {
        $unmanic.websocketEventListeners = {};
      }
      if (!(key in $unmanic.websocketEventListeners)) {
        //console.debug("Adding '" + type + "' event listener to websocket - '" + key + "'")
        $unmanic.ws.addEventListener(type, callback);
        $unmanic.websocketEventListeners[key] = true
      }
    }
  }

  /**
   * Close the websocket without triggering a reconnect
   */
  const closeWebsocket = function () {
    if (typeof $unmanic.ws !== 'undefined' && $unmanic.ws !== null) {
      console.debug("Closing connection to websocket server")
      // Mark connection to not reconnect
      autoReconnectSocket = false;
      // Close WS connection
      $unmanic.ws.close();
      // Set ws as null so that it needs to be recreated
      $unmanic.ws = null;
      // Empty all websocket event listeners
      $unmanic.websocketEventListeners = {};
    }
  }

  return {
    serverId,
    init: function () {
      return initWebsocket();
    },
    close: function () {
      closeWebsocket();
    },
    addEventListener: function (type, key, callback) {
      addWebsocketEventListener(type, key, callback);
    }
  }
}

export default {
  UnmanicWebsocketHandler,
}
