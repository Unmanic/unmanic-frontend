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

        <PendingTasks v-bind="pendingTasksData" />

        <CompletedTasks v-bind="completedTasksData" />

      </div>

    </div>
  </q-page>
</template>

<script>
import WorkerProgress from 'components/WorkerProgress.vue'
import PendingTasks from 'components/PendingTasks.vue'
import CompletedTasks from "components/CompletedTasks";
import dateTools from "src/js/dateTools";

export default {
  name: 'Dashboard',
  components: {CompletedTasks, WorkerProgress, PendingTasks },
  data() {
    return {
      name: "name here",
      connectionTimer: null,
      serverId: null,
      ws: null,
      workerProgressList: [],
      pendingTasksData: {
        taskList: []
      },
      completedTasksData: {
        taskList: []
      }
    }
  },
  methods: {
    checkListsAreDifferent(listA, listB) {
      if (listA.length !== listB.length) {
        return true;
      }
      for (let i = 0; i < listA.length; ++i) {
        if (listA[i] !== listB[i]) {
          return true;
        }
      }
      console.log("SAME2")
      return false;
    },
    updateWorkerProgressCharts: function (data) {

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
      this.workerProgressList = workerData;
    },
    updatePendingTasksList: function (data) {
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
      this.pendingTasksData.taskList = results;
    },
    updateCompletedTasksList: function (data) {
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
      this.completedTasksData.taskList = results;
    },
    openWS: function () {
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
      this.ws = new WebSocket(new_uri);
    },
    reconnectWS: function () {
      this.ws = null;
      this.timer = setTimeout(() => {
        console.debug('Attempting reconnect to Unmanic server...');
        this.initDashboardWebsocket();
      }, 5000);
    },
    initDashboardWebsocket: function () {
      let _this = this
      console.log("Starting connection to WebSocket Server")
      if (this.ws === undefined || this.ws === null) {
        // Open WS connection
        _this.openWS();
      }

      this.ws.onopen = function () {
        clearTimeout(this.timer);
        _this.ws.send('start_workers_info');
        _this.ws.send('start_pending_tasks_info');
        _this.ws.send('start_completed_tasks_info');
      };

      this.ws.onmessage = function (evt) {
        if (typeof evt.data === 'string') {
          let jsonData = JSON.parse(evt.data);
          if (jsonData.success) {
            // Ensure the server is still running the same instance...
            if (_this.serverId === null) {
              _this.serverId = jsonData.server_id;
            } else {
              if (jsonData.server_id !== _this.serverId) {
                // Reload the whole page. Some things may have changed
                console.log('Unmanic server has restarted. Reloading page...');
                location.reload();
              }
            }
            // Parse data type and update the dashboard
            switch (jsonData.type) {
              case 'workers_info':
                _this.updateWorkerProgressCharts(jsonData.data);
                break;
              case 'pending_tasks':
                _this.updatePendingTasksList(jsonData.data);
                break;
              case 'completed_tasks':
                _this.updateCompletedTasksList(jsonData.data);
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

      this.ws.onerror = function (evt) {
        console.error('WebSocket Error: ' + evt);
        // TODO: Clear all workers
        // TODO: Display error
      };

      this.ws.onclose = function () {
        _this.reconnectWS();
      };
    }
  },
  created: function () {
    this.initDashboardWebsocket();
  }
}
</script>
