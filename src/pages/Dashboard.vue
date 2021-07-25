<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-sm">

      <div class="row">
        <div class="col q-ma-sm">
          <q-card>
            <q-card-section class="bg-grey-2">
              <div class="text-h6 text-purple-10">
                <q-icon name="fas fa-spinner"/>
                Workers
              </div>
            </q-card-section>

            <q-card-section>

              <!-- START WORKERS PROGRESS-->
              <div class="row">

                <WorkerProgress
                  v-for="workerProgress in workerProgressList"
                  :key="workerProgress.id"
                  v-bind="workerProgress"
                />

              </div>
              <!-- END WORKERS PROGRESS-->

            </q-card-section>

          </q-card>
        </div>
      </div>

      <div class="row">

        <PendingTasks v-bind="pendingTasksData"/>

        <CompletedTasks v-bind="completedTasksData"/>

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
import { ref, onMounted } from 'vue';

export default {
  name: 'Dashboard',
  components: { CompletedTasks, WorkerProgress, PendingTasks },
  setup() {
    const $q = useQuasar();
    const workerProgressList = ref([]);
    const pendingTasksData = ref({
      taskList: []
    });
    const completedTasksData = ref({
      taskList: []
    });

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
            message: 'Unable to connect to Unmanic backend. Please check that it is running.',
            icon: 'report_problem'
          })
        }
      } else {
        if (typeof clearConnectionWarning === 'function') {
          clearConnectionWarning();
        }
      }
    }

    function updateWorkerProgressCharts(data) {

      let workerData = []
      for (let i = 0; i < data.length; i++) {
        let worker = data[i];

        workerData[worker.id] = {
          id: worker.id,
          name: worker.name,
          progress: 100,
          progressText: '',
          eta: '',
          color: 'warning',
          state: 'Waiting for another task...',
          currentRunner: '',
          startTime: '',
          totalProcTime: '',

          indeterminate: false,
          fullscreen: false,
        }

        if (worker.idle) {
          workerData[worker.id].progressText = 'idle';
          workerData[worker.id].eta = '...';
        } else {
          if (typeof worker.progress.percent !== 'undefined') {
            //console.log(worker.progress)
            workerData[worker.id].state = 'Processing task...'
            workerData[worker.id].color = 'primary';
            workerData[worker.id].progress = Number(worker.progress.percent);
            workerData[worker.id].progressText = worker.progress.percent + '%';
            workerData[worker.id].eta = '...';
            // TODO: Calculate ETA

            // Set the worker data
            let currentRunner;
            for (var x = 0; x < worker.runners_info; x++) {
              if (worker.runners_info[x].status === 'in_progress') {
                currentRunner = value.name;
              }
            }
            workerData[worker.id].currentRunner = currentRunner;
            let startTime = new Date(worker.start_time * 1000);
            workerData[worker.id].startTime = toString(startTime);
            workerData[worker.id].totalProcTime = dateTools.printTimeSinceDate(startTime);
          } else {
            workerData[worker.id].state = '...'
            workerData[worker.id].color = 'warning';
            workerData[worker.id].indeterminate = true;
            workerData[worker.id].progressText = '...';
            workerData[worker.id].eta = '...';
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
      console.log("Starting connection to WebSocket Server")
      if (ws === undefined || ws === null) {
        // Open WS connection
        openWS();
      }

      ws.onopen = function () {
        clearTimeout(connectionTimer);
        connectionWarning(false)
        ws.send('start_workers_info');
        ws.send('start_pending_tasks_info');
        ws.send('start_completed_tasks_info');
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
                console.log('Unmanic server has restarted. Reloading page...');
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
        reconnectWS();
      };
    }

    onMounted(() => {
      // Start the websocket
      initDashboardWebsocket()
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
