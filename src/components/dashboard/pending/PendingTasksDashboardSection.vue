<template>
  <q-card flat bordered>
    <q-card-section class="bg-card-head pending-tasks-card-head">

      <div class="row items-center no-wrap pending-tasks-header">
        <div class="col">
          <div class="text-h6 text-primary">
            <q-icon name="fas fa-list-ul"/>
            {{ $t('headers.pendingTasks') }}
          </div>
        </div>

        <div class="col-auto">
          <q-btn
            @click="openDetails"
            color="secondary"
            dense
            round
            flat
            icon="open_in_full">
            <q-tooltip class="bg-white text-primary">{{ $t('navigation.showMore') }}</q-tooltip>
          </q-btn>
        </div>
      </div>

    </q-card-section>

    <!--MINIMAL SCREEN-->
    <q-card-section class="q-pb-none pending-tasks-card-body">
      <div class="pending-tasks-list-wrap">
        <q-list separator>

          <q-item v-if="!taskList">
            <q-item-section>

              <div class="full-width row flex-center text-accent q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied"/>
                <q-item-label>{{ $t('headers.listEmpty') }}</q-item-label>
                <q-icon size="2em" name="priority_high"/>
              </div>
            </q-item-section>
          </q-item>
          <q-item v-else-if="!taskList.length">
            <q-item-section>

              <div class="full-width row flex-center text-accent q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied"/>
                <q-item-label>{{ $t('headers.listEmpty') }}</q-item-label>
                <q-icon size="2em" name="priority_high"/>
              </div>
            </q-item-section>
          </q-item>
          <q-item
            v-else
            v-for="task in taskList"
            :key="task.id"
            v-bind="task">
            <q-item-section avatar>
              <q-icon name="pending" class="text-amber-10" style="opacity: 0.8;"/>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ task.label }}</q-item-label>
            </q-item-section>
          </q-item>

        </q-list>

      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="row items-center pending-tasks-footer">
        <div class="col"/>
        <div class="col-auto">
          <q-btn
            :label="$t('components.pendingTasks.rescanLibrary')"
            color="secondary"
            outline
            @click="rescanLibrary()"
          />
        </div>
      </div>
      <q-space/>
    </q-card-section>

    <!--FULL SCREEN-->
    <PendingTasksListDialog ref="pendingTasksDetailsDialogRef"/>
  </q-card>
</template>

<script>
import { defineComponent, ref } from "vue";
import PendingTasksListDialog from "components/dashboard/pending/PendingTasksListDialog.vue";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";

export default defineComponent({
  name: 'PendingTasks',
  components: { PendingTasksListDialog },
  setup() {
    const pendingTasksDetailsDialogRef = ref(null);

    return {
      pendingTasksDetailsDialogRef
    }
  },
  props: {
    taskList: {
      type: Array,
      required: true
    }
  },
  methods: {
    openDetails() {
      this.pendingTasksDetailsDialogRef.show();
    },
    rescanLibrary: function () {
      axios({
        method: 'post',
        url: getUnmanicApiUrl('v2', 'pending/rescan')
      }).then((response) => {
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('notifications.rescanLibraryScheduled'),
          icon: 'check_circle',
          actions: [{ icon: 'close', color: 'white' }]
        })
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.rescanLibraryError'),
          icon: 'report_problem',
          actions: [{ icon: 'close', color: 'white' }]
        })
      })
    }
  }
});
</script>

<style scoped>
.pending-tasks-card-head {
  padding: 12px 16px;
}

.pending-tasks-card-body {
  padding: 8px 12px 0;
}

.pending-tasks-list-wrap {
  padding: 12px 8px;
}

.pending-tasks-footer {
  padding: 0 4px;
}

@media (max-width: 600px) {
  .pending-tasks-card-head {
    padding: 10px 12px;
  }

  .pending-tasks-card-body {
    padding: 6px 8px 0;
  }

  .pending-tasks-list-wrap {
    padding: 8px 4px;
  }

  .pending-tasks-header {
    flex-wrap: wrap;
    row-gap: 6px;
  }

  .pending-tasks-footer {
    justify-content: flex-end;
  }

  .pending-tasks-card-body :deep(.q-item) {
    padding: 8px 6px;
  }
}

.pending-tasks-card-body :deep(.q-item__label) {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
