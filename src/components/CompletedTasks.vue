<template>
  <q-card>
    <q-card-section class="bg-card-head">

      <div class="row items-center no-wrap">
        <div class="col">
          <div
            :class="$q.dark.isActive ? 'text-cyan-8' : 'text-cyan-10'"
            class="text-h6">
            <q-icon name="fas fa-list-ul"/>
            {{ $t('headers.completedTasks') }}
          </div>
        </div>

        <div class="col-auto">
          <q-btn
            @click="completedTasksPopup = true"
            color="grey-7"
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
    <q-card-section>
      <div class="q-pa-md">
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
    <q-card-section>

      <q-dialog
        v-model="completedTasksPopup"
        full-width
        full-height
      >
        <q-card>
          <q-card-section class="bg-card-head">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 text-blue-10">
                  <q-icon name="fas fa-list-ul"/>
                  {{ $t('headers.completedTasks') }}
                </div>
              </div>

              <div class="col-auto">
                <q-btn
                  color="grey-7"
                  dense
                  round
                  flat
                  icon="close_fullscreen" v-close-popup>
                  <q-tooltip class="bg-white text-primary">{{ $t('tooltips.close') }}</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">

            <div class="q-pa-md">
              <CompletedTasksTable :initStatusFilter="completedTasksPopupInitStatusFilter"/>
            </div>

          </q-card-section>

        </q-card>
      </q-dialog>
    </q-card-section>

  </q-card>
</template>

<script>
import { defineComponent, ref } from "vue";
import CompletedTasksTable from "components/CompletedTasksTable";

export default defineComponent({
  name: 'CompletedTasks',
  components: { CompletedTasksTable },
  mounted() {
    // Add listeners
    this.$global.$on(
      'completedTasksShowFailed',
      () => {
        this.completedTasksPopupInitStatusFilter = 'failed'
        this.completedTasksPopup = true
      }
    )
  },
  data() {
    return {
      completedTasksPopup: ref(false),
      completedTasksPopupInitStatusFilter: ref('all'),
    }
  },
  props: {
    taskList: {
      type: Array,
      required: true
    }
  }
});
</script>
