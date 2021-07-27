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
                {{ $t('dashboard.headers.workers') }}
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
import { onMounted, ref } from 'vue';
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
        }

        if (!worker.idle) {
          if (typeof worker.progress.percent !== 'undefined') {
            // Set the label
            workerData['worker-' + worker.id].label = worker.name + ': ' + worker.current_file;

            // Set the progress graph
            workerData['worker-' + worker.id].color = 'primary';
            workerData['worker-' + worker.id].progress = Number(worker.progress.percent);
            workerData['worker-' + worker.id].progressText = worker.progress.percent + '%';

            // Set the ETC
            workerData['worker-' + worker.id].etc = dateTools.printTimeAsHoursMinsSeconds(calculateEtc(worker.progress.percent, worker.progress.elapsed));

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
          } else {
            // Set 'indeterminate' defaults
            workerData['worker-' + worker.id].indeterminate = true;
            workerData['worker-' + worker.id].label = '...';
            workerData['worker-' + worker.id].color = 'warning';
            workerData['worker-' + worker.id].progressText = '...';
            workerData['worker-' + worker.id].state = '...';
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
