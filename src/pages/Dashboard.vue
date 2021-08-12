<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <div class="row">
        <div class="col q-ma-sm">
          <q-card>
            <q-card-section class="bg-grey-2">
              <div class="text-h6 text-purple-10">
                <q-icon name="fas fa-spinner"/>
                {{ $t('headers.workers') }}
              </div>
            </q-card-section>

            <q-card-section>

              <!-- START WORKERS PROGRESS-->
              <div class="row">

                <WorkerProgress
                  v-for="(workerProgress, index) in workerProgressList"
                  :key="index"
                  v-bind="workerProgress"
                />

              </div>
              <!-- END WORKERS PROGRESS-->

            </q-card-section>

          </q-card>
        </div>
      </div>

      <div class="row">

        <div class="col-12 col-md-6">
          <div class="q-ma-sm">
            <PendingTasks v-bind="pendingTasksData"/>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="q-ma-sm">
            <CompletedTasks v-bind="completedTasksData"/>
          </div>
        </div>

      </div>

    </div>
  </q-page>
</template>

<script>
import WorkerProgress from 'components/WorkerProgress.vue'
import PendingTasks from 'components/PendingTasks.vue'
import CompletedTasks from "components/CompletedTasks";
import dateTools from "src/js/dateTools";
import { useQuasar } from "quasar";
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from "vue-i18n";

export default {
  name: 'Dashboard',
  components: { CompletedTasks, WorkerProgress, PendingTasks },
  setup() {
    const { t: $t } = useI18n();
    const $q = useQuasar();
    const workerProgressList = ref([]);
    const pendingTasksData = ref({
      taskList: []
    });
    const completedTasksData = ref({
      taskList: []
    });

    let autoReconnectSocket = true;
    let connectionTimer = null;
    let serverId = null;
    let ws;

    let clearConnectionWarning = null;

    function connectionWarning(show) {
      if (show) {
        if (clearConnectionWarning === null) {
          clearConnectionWarning = $q.notify({
            timeout: 0,
            spinner: true,
            color: 'warning',
            position: 'top',
            message: $t('notifications.backendConnectionWarning'),
            icon: 'report_problem'
          })
        }
      } else {
        if (typeof clearConnectionWarning === 'function') {
          clearConnectionWarning();
        }
      }
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

          currentErrorMessages[message_id] = $q.notify({
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

    function updateWorkerProgressCharts(data) {
      function calculateEtc(percent_completed, time_elapsed) {
        let percent_to_go = (100 - parseInt(percent_completed))
        return (parseInt(time_elapsed) / parseInt(percent_completed) * percent_to_go)
      }

      let workerData = {}
      for (let i = 0; i < data.length; i++) {
        let worker = data[i];

        // Set 'idle' status as defaults
        workerData['worker-' + worker.id] = {
          indeterminate: false,
          id: worker.id,        // Eg. '1'
          label: worker.name,
          name: worker.name,    // Eg. 'Worker-1'
          color: 'warning',
          progress: 100,
          progressText: '-',
          etc: '...',
          state: $t('components.workers.state.waiting'),
          currentRunner: $t('components.workers.currentRunner.none'),
          startTime: '',
          totalProcTime: '',
          workerLog: [],
          idle: worker.idle,
          paused: worker.paused
        }

        // If the worker is paused, the setup initial paused style.
        // NOTE: It is possible to have a worker that is 'paused' but not 'idle'.
        //    Therefore this may be modified further below
        if (worker.paused) {
          // Set 'paused' defaults
          workerData['worker-' + worker.id].label = '...';
          workerData['worker-' + worker.id].color = 'negative';
          workerData['worker-' + worker.id].progressText = '...';
          workerData['worker-' + worker.id].state = $t('components.workers.state.paused');
        }
        if (!worker.idle) {
          // Set the label
          workerData['worker-' + worker.id].label = worker.name + ': ' + worker.current_file;
          // Set the progress graph colour
          workerData['worker-' + worker.id].color = 'secondary';
          // Set the worker state
          workerData['worker-' + worker.id].state = $t('components.workers.state.processing');

          // Set the current runner this worker is executing
          let currentRunner = $t('components.workers.currentRunner.indeterminate');
          if (typeof worker.runners_info === 'object' && worker.runners_info !== null) {
            for (const [runnerKey, runnerValue] of Object.entries(worker.runners_info)) {
              if (runnerValue.status === 'in_progress') {
                currentRunner = runnerValue.name;
              }
            }
          }
          workerData['worker-' + worker.id].currentRunner = currentRunner;

          // Set the start and total processing time
          let startTime = new Date(worker.start_time * 1000);
          workerData['worker-' + worker.id].startTime = dateTools.printDateTimeString(worker.start_time);
          workerData['worker-' + worker.id].totalProcTime = dateTools.printTimeSinceDate(startTime);

          // Set the worker log file
          workerData['worker-' + worker.id].workerLog = worker.worker_log_tail;

          // Set progress if progress is given
          if (typeof worker.subprocess.percent !== 'undefined' && worker.subprocess.percent !== '') {

            // Set the progress graph
            workerData['worker-' + worker.id].progress = Number(worker.subprocess.percent);
            workerData['worker-' + worker.id].progressText = worker.subprocess.percent + '%';

            // Set the ETC
            workerData['worker-' + worker.id].etc = dateTools.printTimeAsHoursMinsSeconds(calculateEtc(worker.subprocess.percent, worker.subprocess.elapsed));

          } else {
            // Set progress as 'indeterminate' if no progress is given
            workerData['worker-' + worker.id].indeterminate = true;
            workerData['worker-' + worker.id].progressText = '...';
          }

          // If the worker is paused mid task, then flick it over to paused statue formatting
          if (worker.paused) {
            workerData['worker-' + worker.id].indeterminate = true;
            workerData['worker-' + worker.id].color = 'negative';
            workerData['worker-' + worker.id].state = $t('components.workers.state.paused');
          }
        }
      }
      workerProgressList.value = workerData;
    }

    function updatePendingTasksList(data) {
      let result;
      let results = [];
      for (let i = 0; i < data.results.length; i++) {
        result = data.results[i];
        results[i] = {
          id: data.results[i].id,
          priority: data.results[i].priority,
          label: data.results[i].label,
          status: data.results[i].status,
        }
      }
      pendingTasksData.value.taskList = results;
    }

    function updateCompletedTasksList(data) {
      let result;
      let results = [];
      for (let i = 0; i < data.results.length; i++) {
        result = data.results[i];
        results[i] = {
          id: data.results[i].id,
          label: data.results[i].label,
          dateTimeCompleted: dateTools.printDateTimeString(data.results[i].finish_time),
          dateTimeSinceCompleted: data.results[i].human_readable_time,
        }
      }
      completedTasksData.value.taskList = results;
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
        initDashboardWebsocket();
      }, 4000);
    }

    function initDashboardWebsocket() {
      console.debug("Starting connection to websocket server")
      if (ws === undefined || ws === null) {
        // Open WS connection
        openWS();
      }

      ws.onopen = function () {
        clearTimeout(connectionTimer);
        connectionWarning(false)
        ws.send(JSON.stringify({ command: 'start_frontend_messages', params: {} }));
        ws.send(JSON.stringify({ command: 'start_workers_info', params: {} }));
        ws.send(JSON.stringify({ command: 'start_pending_tasks_info', params: {} }));
        ws.send(JSON.stringify({ command: 'start_completed_tasks_info', params: {} }));
      };

      ws.onmessage = function (evt) {
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
              case 'workers_info':
                updateWorkerProgressCharts(jsonData.data);
                break;
              case 'pending_tasks':
                updatePendingTasksList(jsonData.data);
                break;
              case 'completed_tasks':
                updateCompletedTasksList(jsonData.data);
                break;
              case 'frontend_message':
                displayMessages(jsonData.data);
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
        // Clear all workers
        updateWorkerProgressCharts([]);
        // Display error
        connectionWarning(true);
      };

      ws.onclose = function () {
        if (autoReconnectSocket) {
          reconnectWS();
        }
      };
    }

    function closeDashboardWebsocket() {
      console.debug("Closing connection to websocket server")
      if (ws !== undefined && ws !== null) {
        // Mark connection to not reconnect
        autoReconnectSocket = false;
        // Close WS connection
        ws.close();
      }
    }

    onMounted(() => {
      // Start the websocket
      initDashboardWebsocket();
    })

    onUnmounted(() => {
      // Close the websocket
      closeDashboardWebsocket();
    })

    return {
      connectionTimer,
      serverId,
      ws,
      workerProgressList,
      pendingTasksData,
      completedTasksData,
      initDashboardWebsocket
    }
  }
}
</script>
