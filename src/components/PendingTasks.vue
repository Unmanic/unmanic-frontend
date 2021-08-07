<template>
  <q-card>
    <q-card-section class="bg-grey-2">

      <div class="row items-center no-wrap">
        <div class="col">
          <div class="text-h6 text-amber-10">
            <q-icon name="fas fa-list-ul"/>
            {{ $t('headers.pendingTasks') }}
          </div>
        </div>

        <div class="col-auto">
          <q-btn
            @click="pendingTasksPopup = true"
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
                <q-item-label>The Pending Tasks list is empty</q-item-label>
                <q-icon size="2em" name="priority_high"/>
              </div>
            </q-item-section>
          </q-item>
          <q-item v-else-if="!taskList.length">
            <q-item-section>

              <div class="full-width row flex-center text-accent q-gutter-sm">
                <q-icon size="2em" name="sentiment_dissatisfied"/>
                <q-item-label>The Pending Tasks list is empty</q-item-label>
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

    <!--FULL SCREEN-->
    <q-card-section>

      <q-dialog
        v-model="pendingTasksPopup"
        full-width
        full-height
      >
        <q-card>
          <q-card-section class="bg-grey-2">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6 text-amber-10">
                  <q-icon name="fas fa-list-ul"/>
                  Pending Tasks
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
              <PendingTasksTable/>
            </div>

          </q-card-section>

        </q-card>
      </q-dialog>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref } from "vue";
import PendingTasksTable from "components/PendingTasksTable";

export default defineComponent({
  name: 'PendingTasks',
  components: { PendingTasksTable },
  data() {
    return {
      pendingTasksPopup: ref(false)
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
