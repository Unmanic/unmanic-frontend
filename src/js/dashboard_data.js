import { App } from './app';
import { defineCustomElements } from 'ui-progress-circle/loader';

// import dashboardWorkerDetailsTemplate from '../templates/sections/dashboard-worker-details.hbs';
import dashboardCompletedTasksTemplate from '../templates/sections/dashboard-completed-tasks.hbs';
import dashboardWorkerProgressTemplate from '../templates/sections/dashboard-worker-progress.hbs';

let $dashWS = {
  timer: null,
  ws: null,
  serverId: null,
};
let wsDashboard = function () {
  // Check if connection exists
  if ($dashWS === undefined || $dashWS.ws === null) {
    // Build WS path
    let loc = window.location,
      new_uri;
    if (loc.protocol === 'https:') {
      new_uri = 'wss:';
    } else {
      new_uri = 'ws:';
    }
    new_uri += '//' + loc.host + '/dashws';

    // Open WS connection
    $dashWS.ws = new WebSocket(new_uri);
  }

  // Return WS
  return $dashWS.ws;
};

export const DashboardData = (function () {
  let updateCompletedTasks = function (data) {
    // Create template data
    let template_data = {
      list_items: data,
    };
    // Fetch template and display
    $('div#completed_tasks').html(dashboardCompletedTasksTemplate(template_data));
  };

  let clearWorkerPieCharts = function () {
    $('#worker_pie_charts').html('<div id="worker_pie_chart_notifications"></div>');
  };

  let updateWorkerProgressCharts = function (data) {
    let default_percent_value = 100;
    let default_status_text = 'IDLE';

    let insertData = function (group_id, element) {
      const bar_colors = ['danger', 'warning', 'success'];

      let worker_progress_bar = $('#unmanic_worker_progress_bar_' + element.id);
      let worker_progress_value = $('#unmanic_worker_progress_value_' + element.id);
      let worker_progress_activity = $('#unmanic_worker_progress_activity_' + element.id);
      let worker_progress_unit = $('#unmanic_worker_progress_unit_' + element.id);
      let worker_progress_status = $('#unmanic_worker_progress_status_' + element.id);

      if (element.idle) {
        // Remove units from text
        worker_progress_status.text(default_status_text);
        worker_progress_unit.text('');
        worker_progress_bar.attr('value', default_percent_value);
        worker_progress_bar.attr('color', '#009dc7');
        worker_progress_value.text('');
        worker_progress_activity.addClass('hidden');
      } else {
        if (typeof element.progress.percent !== 'undefined') {
          // Set units to percent
          worker_progress_status.text('');
          worker_progress_unit.text('%');
          worker_progress_bar.attr('value', element.progress.percent);
          worker_progress_bar.attr('color', bar_colors[~~(element.progress.percent / 50)]);
          worker_progress_value.text(element.progress.percent);
          worker_progress_activity.removeClass('hidden');
        } else {
          // Worker does not yet have a percent
          worker_progress_status.text(default_status_text);
          worker_progress_unit.text('');
          worker_progress_bar.attr('value', 0);
          worker_progress_bar.attr('color', '#1c5');
          worker_progress_value.text('');
          worker_progress_activity.addClass('hidden');
        }
      }
    };

    let addNewChart = function (group_id, element) {
      // Insert the template into the container
      let template_data = element;
      template_data.group_id = 'unmanic_worker_' + element.id;
      $('div#worker_pie_charts').append(dashboardWorkerProgressTemplate(template_data));
      // Update data
      insertData(group_id, element);
    };

    // Create list of ids that should exist
    let element_list = [];
    // Set the class of all .number divs. (active or idle)
    // If the element does not yet exist (a new worker was created) then add it
    data.forEach(function (element) {
      let group_id = '#unmanic_worker_' + element.id;
      element_list.push(group_id);
      if ($(group_id).length) {
        insertData(group_id, element);
      } else {
        addNewChart(group_id, element);
      }
    });
    // If an element exists but it should not, remove it
    $('.unmanic-worker').each(function () {
      if (!element_list.includes('#' + $(this).attr('id'))) {
        // element does not belong
        console.debug('Removing worker - ' + $(this).attr('id'));
        $(this).remove();
      }
    });
  };

  return {
    initWorkerProgressCharts: function () {
      defineCustomElements().then(function () {
        console.debug('ui-progress-circle loaded');
      });
    },

    initDashboardWebsocket: function () {
      let ws = wsDashboard();
      let wsSend = function () {
        ws.send('start_workers_info');
        ws.send('start_completed_tasks_info');
      };
      ws.onopen = function () {
        clearTimeout($dashWS.timer);
        clearWorkerPieCharts();
        wsSend();
      };
      ws.onmessage = function (evt) {
        if (typeof evt.data === 'string') {
          let jsonData = JSON.parse(evt.data);
          if (jsonData.success) {
            // Ensure the server is still running the same instance...
            if ($dashWS.serverId === null) {
              $dashWS.serverId = jsonData.server_id;
            } else {
              if (jsonData.server_id !== $dashWS.serverId) {
                // Reload the whole page. Some things may have changed
                console.log('Unmanic server has restarted. Reloading page...');
                location.reload();
              }
            }
            // Parse data type and update the dashboard
            switch (jsonData.type) {
              case 'workers_info':
                updateWorkerProgressCharts(jsonData.data);
                break;
              case 'completed_tasks':
                updateCompletedTasks(jsonData.data);
                break;
              default:
                console.error('WebSocket Error: Received data was not a valid type - ' + jsonData.type);
                break;
            }
          } else {
            console.error('WebSocket Error: Received contained errors - ' + evt.data);
          }
        } else {
          console.error('WebSocket Error: Received data was not JSON - ' + evt.data);
        }
      };
      ws.onerror = function (evt) {
        console.error('WebSocket Error: ' + evt);
        clearWorkerPieCharts();
        App.alert({
          container: '#worker_pie_chart_notifications',
          place: 'append',
          type: 'danger',
          message: 'Could not update workers. Please check that Unmanic is still running.',
          close: false,
          reset: true,
          focus: false,
          closeInSeconds: 0,
          icon: 'warning',
        });
      };
      ws.onclose = function () {
        $dashWS.ws = null;
        $dashWS.timer = setTimeout(() => {
          console.debug('Attempting reconnect to Unmanic server...');
          DashboardData.initDashboardWebsocket();
        }, 5000);
      };
    },

    init: function () {
      // Init the progress charts
      this.initWorkerProgressCharts();
      // Init the websocket
      this.initDashboardWebsocket();
    },
  };
})();
