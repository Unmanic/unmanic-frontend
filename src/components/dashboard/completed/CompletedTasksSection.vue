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
              <q-icon
                v-if="task.success"
                name="check_circle"
                class="text-secondary"
                style="opacity: 0.8;"/>
              <q-icon
                v-else
                name="cancel"
                class="text-negative"
                style="opacity: 0.8;"/>
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

    <!--FULL SCREEN-->
    <CompletedTasksMoreDetailsDialog
      ref="completedTasksDetailsDialogRef"
      :initStatusFilter="completedTasksPopupInitStatusFilter"
    />

  </q-card>
</template>

<script>
import { defineComponent, ref } from "vue";
import CompletedTasksMoreDetailsDialog from "components/dashboard/completed/CompletedTasksMoreDetailsDialog.vue";

export default defineComponent({
  name: 'CompletedTasks',
  components: { CompletedTasksMoreDetailsDialog },
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
</style>
