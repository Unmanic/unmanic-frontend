<template>
  <q-card flat bordered>
    <q-card-section class="bg-card-head completed-tasks-card-head">

      <div class="row items-center no-wrap completed-tasks-header">
        <div class="col">
          <div class="text-h6 text-primary">
            <q-icon name="fas fa-list-ul"/>
            {{ $t('headers.completedTasks') }}
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
    <q-card-section class="completed-tasks-card-body">
      <div class="completed-tasks-list-wrap">
        <q-list
          separator>

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
              <q-btn
                @click.stop="openTaskDetails(task.id)"
                :icon="task.success ? 'check_circle' : 'cancel'"
                :color="task.success ? 'secondary' : 'negative'"
                :aria-label="$t('components.completedTasks.details') + ': ' + task.label"
                dense
                round
                flat
                style="opacity: 0.8;">
                <q-tooltip>{{ $t('components.completedTasks.details') }}</q-tooltip>
              </q-btn>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ task.label }}</q-item-label>
            </q-item-section>
            <q-item-section side top>
              <div class="row">
                <div class="column justify-center">
                  <q-item-label
                    caption>
                    {{ task.dateTimeSinceCompleted }}
                  </q-item-label>
                </div>
                <div class="column justify-center">
                  <q-icon
                    class="q-ml-sm"
                    name="event"
                    size="18px"/>
                </div>
              </div>

            </q-item-section>
          </q-item>

        </q-list>
      </div>
    </q-card-section>

    <CompletedTaskLogDialog
      v-if="selectedTaskId !== null"
      :key="selectedTaskId"
      ref="taskDetailsDialogRef"
      :completedTaskId="selectedTaskId"
      @hide="selectedTaskId = null"
    />

    <!--FULL SCREEN-->
    <CompletedTasksListDialog
      ref="completedTasksDetailsDialogRef"
      :initStatusFilter="completedTasksPopupInitStatusFilter"
    />

  </q-card>
</template>

<script>
import { defineComponent, ref } from "vue";
import CompletedTaskLogDialog from "components/dashboard/completed/CompletedTaskLogDialog.vue";
import CompletedTasksListDialog from "components/dashboard/completed/CompletedTasksListDialog.vue";

export default defineComponent({
  name: 'CompletedTasks',
  components: { CompletedTasksListDialog, CompletedTaskLogDialog },
  setup() {
    const completedTasksDetailsDialogRef = ref(null);

    return {
      completedTasksDetailsDialogRef
    }
  },
  mounted() {
    // Add listeners
    this.$global.$on(
      'completedTasksShowFailed',
      () => {
        this.completedTasksPopupInitStatusFilter = 'failed'
        this.openDetails()
      }
    )
  },
  data() {
    return {
      completedTasksPopupInitStatusFilter: 'all',
      selectedTaskId: null,
    }
  },
  props: {
    taskList: {
      type: Array,
      required: true
    }
  },
  methods: {
    openTaskDetails(id) {
      this.selectedTaskId = String(id);
      this.$nextTick(() => {
        this.$refs.taskDetailsDialogRef.show();
      });
    },
    openDetails() {
      this.completedTasksDetailsDialogRef.show();
    }
  }
});
</script>

<style scoped>
.completed-tasks-card-head {
  padding: 12px 16px;
}

.completed-tasks-card-body {
  padding: 8px 12px;
}

.completed-tasks-list-wrap {
  padding: 12px 8px;
}

@media (max-width: 600px) {
  .completed-tasks-card-head {
    padding: 10px 12px;
  }

  .completed-tasks-card-body {
    padding: 6px 8px;
  }

  .completed-tasks-list-wrap {
    padding: 8px 4px;
  }

  .completed-tasks-header {
    flex-wrap: wrap;
    row-gap: 6px;
  }

  .completed-tasks-card-body :deep(.q-item) {
    padding: 8px 6px;
  }
}

.completed-tasks-card-body :deep(.q-item__label) {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
