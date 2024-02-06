<template>
  <q-page padding>
    <!-- content -->

    <div class="q-pa-none">

      <div class="row">
        <div class="col q-ma-sm">
          <q-card>
            <q-card-section class="bg-card-head">

              <div class="row items-center no-wrap">
                <div class="col">
                  <div
                    :class="$q.dark.isActive ? 'text-primary' : 'text-indigo-10'"
                    class="text-h6">
                    <q-icon name="fas fa-spinner"/>
                    {{ $t('headers.workers') }}
                  </div>
                </div>

                <div class="col-auto">
                  <q-btn-dropdown
                    class="q-ml-sm"
                    :color="Object.keys(workerProgressList).length === 0 ? 'grey-7' : 'secondary'"
                    :disable-main-btn="Object.keys(workerProgressList).length === 0"
                    :label="$t('navigation.options')">
                    <q-list>

                      <q-item
                        clickable
                        @click="pauseAllWorkers()"
                        v-close-popup>
                        <q-item-section>
                          <q-item-label>
                            <q-icon name="pause"/>
                            {{ $t('components.workers.pauseAllWorkers') }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        @click="resumeAllWorkers()"
                        v-close-popup>
                        <q-item-section>
                          <q-item-label>
                            <q-icon name="play_arrow"/>
                            {{ $t('components.workers.resumeAllWorkers') }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-separator/>

                      <q-item
                        clickable
                        @click="terminateAllWorkers()"
                        v-close-popup>
                        <q-item-section>
                          <q-item-label>
                            <q-icon name="fas fa-skull-crossbones"/>
                            {{ $t('components.workers.terminateAllWorkers') }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>

                    </q-list>
                  </q-btn-dropdown>
                </div>
              </div>
            </q-card-section>

            <q-card-section>

              <!-- START WORKERS PROGRESS-->
              <div class="row">

                <div
                  v-if="Object.keys(workerProgressList).length === 0"
                  class="full-width row flex-center text-accent q-gutter-sm">
                  <q-item-label>{{ $t('components.workers.listEmpty') }}</q-item-label>
                </div>
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

    <ReleaseNotesDialog/>

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
import { UnmanicWebsocketHandler } from "src/js/unmanicWebsocket";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import ReleaseNotesDialog from "components/ReleaseNotesDialog";

export default {
  name: 'MainDashboard',
  components: { ReleaseNotesDialog, CompletedTasks, WorkerProgress, PendingTasks },
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

    let ws = null;
    let unmanicWSHandler = UnmanicWebsocketHandler($t);

    let workerGroupColours = {}

    function updateWorkerProgressCharts(data) {
      function calculateEtc(percent_completed, time_elapsed) {
        let percent_to_go = (100 - parseInt(percent_completed))
        return (parseInt(time_elapsed) / parseInt(percent_completed) * percent_to_go)
      }

      // Credit:
      //    https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
      function generateBackgroundColour(name) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        let colour = '#';
        for (let i = 0; i < 3; i++) {
          let value = (hash >> (i * 8)) & 0xFF;
          colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
      }

      let workerData = {}
      for (let i = 0; i < data.length; i++) {
        let worker = data[i];

        // Set background colour
        let workerGroupColour;
        if (worker.name in workerGroupColours) {
          workerGroupColour = workerGroupColours[worker.name];
        } else {
          workerGroupColours[worker.name] = generateBackgroundColour(worker.name);
          workerGroupColour = workerGroupColours[worker.name];
        }

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
          paused: worker.paused,
          workerGroupColour: workerGroupColour,
        }

        // If the worker is paused, the setup initial paused style.
        // NOTE: It is possible to have a worker that is 'paused' but not 'idle'.
        //    Therefore this may be modified further below
        if (worker.paused) {
          // Set 'paused' defaults
          workerData['worker-' + worker.id].label = worker.name;
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
          const processingDuration = (new Date() - new Date(worker.start_time * 1000)) / 1000;
          workerData['worker-' + worker.id].startTime = dateTools.printDateTimeString(worker.start_time);
          workerData['worker-' + worker.id].totalProcTime = dateTools.printSecondsAsDuration(processingDuration);

          // Set the worker log file
          workerData['worker-' + worker.id].workerLog = worker.worker_log_tail;

          // Set progress if progress is given
          if (typeof worker.subprocess.percent !== 'undefined' && worker.subprocess.percent !== '') {

            // Set the progress graph
            workerData['worker-' + worker.id].progress = Number(worker.subprocess.percent);
            workerData['worker-' + worker.id].progressText = worker.subprocess.percent + '%';

            // Set the ETC
            const etcDuration = calculateEtc(worker.subprocess.percent, worker.subprocess.elapsed)
            workerData['worker-' + worker.id].etc = dateTools.printSecondsAsDuration(etcDuration);
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
          success: data.results[i].success,
        }
      }
      completedTasksData.value.taskList = results;
    }

    function initDashboardWebsocket() {
      ws = unmanicWSHandler.init();
      let serverId = unmanicWSHandler.serverId;

      unmanicWSHandler.addEventListener('open', 'start_dashboard_messages', function (evt) {
        ws.send(JSON.stringify({ command: 'start_workers_info', params: {} }));
        ws.send(JSON.stringify({ command: 'start_pending_tasks_info', params: {} }));
        ws.send(JSON.stringify({ command: 'start_completed_tasks_info', params: {} }));
      });

      unmanicWSHandler.addEventListener('message', 'handle_dashboard_messages', function (evt) {
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
            }
          } else {
            console.error('WebSocket Error: Received contained errors - ' + evt.data);
          }
        } else {
          console.error('WebSocket Error: Received data was not JSON - ' + evt.data);
        }
      });
    }

    function closeDashboardWebsocket() {
      unmanicWSHandler.close();
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
      workerProgressList,
      pendingTasksData,
      completedTasksData
    }
  },
  methods: {
    pauseAllWorkers: function () {
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'workers/worker/pause/all'),
        data: {}
      }).then((response) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('components.workers.workerPaused'),
          icon: 'check_circle',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.workers.workerPausedFailed'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    },
    resumeAllWorkers: function () {
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'workers/worker/resume/all'),
        data: {}
      }).then((response) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('components.workers.workerResumed'),
          icon: 'check_circle',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.workers.workerResumedFailed'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    },
    terminateWorker: function (workerId) {
      let data = {
        worker_id: workerId,
      }
      axios({
        method: 'delete',
        url: getUnmanicApiUrl('v2', 'workers/worker/terminate'),
        data: data
      }).then((response) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('components.workers.workerTerminated'),
          icon: 'check_circle',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('components.workers.workerTerminationFailed'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    },
    terminateAllWorkers: function () {
      for (let key in this.workerProgressList) {
        let workerData = this.workerProgressList[key];
        if (workerData.idle) {
          this.terminateWorker(workerData.id);
        } else {
          // If the worker is not idle, prompt to confirm the termination
          this.$q.dialog({
            title: this.$t('headers.confirm') + ' - ' + workerData.name,
            message: this.$t('components.workers.terminateWorkerWarning'),
            cancel: true,
            persistent: true
          }).onOk(() => {
            this.terminateWorker(workerData.id);
          })
        }
      }
    }
  }
}
</script>
