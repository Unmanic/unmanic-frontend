<template>

  <q-list padding>

    <q-item>
      <q-space/>
      <q-item-section
        class="on-right"
        style="padding-right:0;"
        top
        side>
        <div class="text-grey-8 q-gutter-xs">
          <q-btn
            dense
            size="sm"
            color="secondary"
            :label="$t('buttons.dismissAll')"
            @click="dismissAllNotifications()"/>
        </div>
      </q-item-section>
    </q-item>

    <q-item
      v-for="(notification, index) in notificationsList"
      v-bind:key="index"
      clickable
    >

      <q-item-section avatar @click="runNotificationAction(index)">
        <q-icon
          :color="notification.color"
          :name="notification.icon"/>
      </q-item-section>

      <q-item-section @click="runNotificationAction(index)">
        <q-item-label>
          {{ notification.label }}
        </q-item-label>
        <q-item-label caption lines="1">
          {{ notification.message }}
        </q-item-label>
        <q-tooltip>
          {{ notification.message }}
        </q-tooltip>
      </q-item-section>

      <q-item-section top side>
        <div class="text-grey-8 q-gutter-xs">
          <q-btn class="gt-xs" size="12px"
                 flat dense round
                 icon="close"
                 @click="dismissNotification(index)"/>
        </div>
      </q-item-section>

    </q-item>

  </q-list>

</template>

<script>

import { ref } from 'vue';
import unmanicGlobals from "src/js/unmanicGlobals";

export default {
  name: 'DrawerNotifications',
  components: {},
  methods: {
    runNotificationAction: function (index) {
      if (this.notificationActionsDisabled) {
        console.debug('Notification actions disabled');
        return;
      }
      // Disable any other actions being triggered while this one is being run
      this.notificationActionsDisabled = true;
      // Get notification by index
      let notification = this.notificationsList[index];
      if (
        typeof notification.navigation === 'object' &&
        notification.navigation !== null &&
        !Array.isArray(notification.navigation)
      ) {
        // Handle full url
        if (typeof notification.navigation['url'] !== 'undefined') {
          window.open(notification.navigation['url'], '_blank');
        }
        // Handle routing any given 'push' links
        if (typeof notification.navigation['push'] !== 'undefined') {
          this.$router.push(notification.navigation['push'])
        }
        if (typeof notification.navigation['events'] !== 'undefined') {
          let i = 0;
          const loopEventsDelayed = function (emitter) {
            if (i < notification.navigation['events'].length) {
              setTimeout(function () {
                let triggerEvent = notification.navigation['events'][i]
                emitter(triggerEvent)
                i++;
                loopEventsDelayed(emitter)
              }, 200)
            }
          }
          loopEventsDelayed(this.$global.$emit)
        }
      }
      // Re-enable notification actions
      this.notificationActionsDisabled = false;
    },
    dismissNotification: function (index) {
      // Get notification by index
      let notification = this.notificationsList[index];
      // Dismiss the matching notification
      unmanicGlobals.dismissNotifications(this.$t, [notification.uuid]).then(() => {
        this.updateNotificationList();
      })
    },
    dismissAllNotifications: function () {
      let uuidList = [];
      for (let i = 0; i < this.notificationsList.length; i++) {
        let notification = this.notificationsList[i];
        uuidList[uuidList.length] = notification.uuid;
      }
      // Dismiss the notifications
      unmanicGlobals.dismissNotifications(this.$t, uuidList).then(() => {
        this.updateNotificationList();
      })
    },
    updateNotificationList: function () {
      unmanicGlobals.updateUnmanicNotifications(this.$t).then((notificationsList) => {
        this.notificationsList = notificationsList;
      })
    },
    startNotificationReload: function () {
      // Run an initial update
      this.updateNotificationList();
      // Start an interval to reload it every 15 seconds
      this.reloadInterval = setInterval(() => {
        this.updateNotificationList();
      }, 15000);
    },
    stopNotificationReload: function () {
      clearInterval(this.reloadInterval);
    }
  },
  mounted() {
    this.startNotificationReload();
  },
  unmounted() {
    this.stopNotificationReload();
  },
  data: function () {
    return {
      reloadInterval: ref(null),
      notificationsList: ref([]),
      notificationActionsDisabled: ref(false),
    }
  }
}
</script>
