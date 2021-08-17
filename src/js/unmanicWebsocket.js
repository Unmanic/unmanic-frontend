import { Notify } from 'quasar'

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
  let autoReconnectSocket = true;
  let connectionTimer = null;
  let serverId = null;
  let ws;

  const initWebsocket = function () {

    let clearConnectionWarning = null;

    function connectionWarning(show) {
      if (show) {
        if (clearConnectionWarning === null) {
          clearConnectionWarning = Notify.create({
            timeout: 0,
            spinner: true,
            color: 'warning',
            position: 'top',
            message: $t('notifications.backendConnectionWarning'),
            icon: 'report_problem'
          });
        }
      } else {
        if (typeof clearConnectionWarning === 'function') {
          clearConnectionWarning();
        }
      }
    }

    function openWS() {
      // Build WS path
      let loc = window.location,
        new_uri;
      if (loc.protocol === 'https:') {
        new_uri = 'wss:';
      } else {
        new_uri = 'ws:';
      }
      new_uri += '//' + loc.host + '/websocket';

      // Open WS connection
      ws = new WebSocket(new_uri);
    }

    function reconnectWS() {
      ws = null;
      connectionTimer = setTimeout(() => {
        console.debug('Attempting reconnect to Unmanic server...');
        initWebsocket();
      }, 4000);
    }

    let currentErrorMessages = {};

    function dismissMessages(message_id) {
      if (typeof currentErrorMessages[message_id] === 'function') {
        currentErrorMessages[message_id]();
        if (ws !== undefined && ws !== null) {
          ws.send(JSON.stringify({ command: 'dismiss_message', params: { message_id: message_id } }));
        }
      }
      if (typeof currentErrorMessages[message_id] !== undefined) {
        delete currentErrorMessages[message_id]
      }
    }

    function displayMessages(data) {
      let current_ids = []
      for (let i = 0; i < data.length; i++) {
        let message_id = data[i].id
        let type = data[i].type
        let code = data[i].code
        let message = data[i].message
        let timeout = data[i].timeout
        if (!(message_id in currentErrorMessages)) {
          // Fetch message string from i18n
          let notificationStringId = 'notifications.serverMessages.' + code
          let notificationString = $t(notificationStringId)
          // If i18n doesnt have this string ID, then revert to default
          if (notificationString === notificationStringId) {
            notificationString = $t('notifications.serverMessages.defaults.' + type);
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

          currentErrorMessages[message_id] = Notify.create({
            timeout: timeout,
            color: color,
            position: 'bottom-right',
            message: notificationString + ' - ' + message,
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
        current_ids[current_ids.length] = message_id
      }
      for (let message_id in currentErrorMessages) {
        if (!(current_ids.includes(message_id))) {
          dismissMessages(message_id);
        }
      }
    }

    if (ws === undefined || ws === null) {
      console.debug("Starting connection to websocket server")
      // Open WS connection
      openWS();
    }

    ws.addEventListener("open", function (evt) {
      clearTimeout(connectionTimer);
      connectionWarning(false)
      ws.send(JSON.stringify({ command: 'start_frontend_messages', params: {} }));
    });

    ws.addEventListener("message", function (evt) {
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
          console.error('WebSocket Error: Received contained errors - ' + evt.data);
        }
      } else {
        console.error('WebSocket Error: Received data was not JSON - ' + evt.data);
      }
    });

    ws.addEventListener("error", function (evt) {
      console.error('WebSocket Error: ' + evt);
      // Display error
      connectionWarning(true);
    });

    ws.addEventListener("close", function (evt) {
      if (autoReconnectSocket) {
        reconnectWS();
      }
    });

    return ws;
  }

  const closeWebsocket = function () {
    if (ws !== undefined && ws !== null) {
      console.debug("Closing connection to websocket server")
      // Mark connection to not reconnect
      autoReconnectSocket = false;
      // Close WS connection
      ws.close();
    }
  }

  return {
    init: function () {
      return initWebsocket();
    },
    close: function () {
      closeWebsocket();
    }
  }
}

export default {
  UnmanicWebsocketHandler,
}
