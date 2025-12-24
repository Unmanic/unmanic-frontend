<template>
  <q-card flat bordered>
    <q-card-section class="bg-card-head">

      <div class="row items-center no-wrap">
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
    <q-card-section class="q-pb-none">
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
      <div class="row">
        <div class="col">
        </div>
        <div class="col">
          <q-btn
            class="float-right"
            :label="$t('components.pendingTasks.rescanLibrary')"
            color="secondary"
            outline
            @click="rescanLibrary()"/>
        </div>
      </div>
      <q-space/>
    </q-card-section>

    <!--FULL SCREEN-->
    <PendingTasksMoreDetailsDialog ref="pendingTasksDetailsDialogRef"/>
  </q-card>
</template>

<script>
import { defineComponent, ref } from "vue";
import PendingTasksMoreDetailsDialog from "components/dashboard/pending/PendingTasksMoreDetailsDialog.vue";
import axios from "axios";
import { getUnmanicApiUrl } from "src/js/unmanicGlobals";

export default defineComponent({
  name: 'PendingTasks',
  components: { PendingTasksMoreDetailsDialog },
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
