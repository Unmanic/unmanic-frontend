<template>
  <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
    <q-list padding>

      <!--START LANGUAGE SELECT-->
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="language"/>
        </q-item-section>
        <q-item-section>
          <LanguageSwitch/>
        </q-item-section>
      </q-item>
      <!--END LANGUAGE SELECT-->

      <!--START LOGOUT-->
      <q-item
        v-if="unmanicSession && unmanicSession.level && unmanicSession.level > 0"
        clickable
        @click="logoutSubmit"
        v-ripple>
        <q-item-section avatar>
          <q-icon name="logout"/>
        </q-item-section>
        <q-item-section>
          <form action="#" method="post" ref="logoutForm">
            <input type="hidden" name="uuid" value="" ref="logoutFormUuid"/>
            <input type="hidden" name="current_uri" value="" ref="logoutFormCurrentUri"/>
          </form>
          Logout
        </q-item-section>
      </q-item>
      <!--END LOGOUT-->
      <!--START LOGIN-->
      <q-item
        v-else
        clickable
        @click="loginSubmit"
        v-ripple>
        <q-item-section avatar>
          <q-icon name="login"/>
        </q-item-section>
        <q-item-section>
          <form action="#" method="post" ref="loginForm">
            <input type="hidden" name="uuid" value="" ref="loginFormUuid"/>
            <input type="hidden" name="current_uri" value="" ref="loginFormCurrentUri"/>
          </form>
          Login
        </q-item-section>
        <div>
        </div>
      </q-item>
      <!--END LOGOUT-->

    </q-list>
  </q-scroll-area>

  <Avatar/>
</template>

<script>

import Avatar from "components/Avatar";
import LanguageSwitch from "components/LanguageSwitch";
import { ref } from "vue";
import unmanicGlobals, { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import axios from "axios";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export default {
  components: { Avatar, LanguageSwitch },
  setup() {
    const $q = useQuasar();
    const { t: $t } = useI18n();
    const unmanicSession = ref(null);
    const formAction = ref(null)
    const uuid = ref(null)
    const currentUri = ref(null)

    unmanicGlobals.getUnmanicSession().then((session) => {
      unmanicSession.value = session;
    })

    return {
      unmanicSession,
      formAction,
      uuid,
      currentUri,
    }
  },
  methods: {
    loginSubmit() {
      // TODO: Create v2 API endpoint
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v1', 'session/unmanic-patreon-login-url'),
      }).then((response) => {
        if (response.data.success) {
          // If query was successful...
          // Set the action URL
          this.$refs.loginForm.action = response.data.data.url;
          // Set the UUID
          this.$refs.loginFormUuid.value = response.data.uuid;
          // Set the current URI
          this.$refs.loginFormCurrentUri.value = window.location.origin + "/trigger/?session=reload";
          // Submit the form
          this.$refs.loginForm.submit()

        } else {
          // Our query was unsuccessful
          console.error('An error occurred while fetching the patreon sponsor page.');
        }
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchLoginUrl'),
          icon: 'report_problem'
        })
      })
    },
    logoutSubmit() {
      // TODO: Create v2 API endpoint
      axios({
        method: 'get',
        url: getUnmanicApiUrl('v1', 'session/unmanic-sign-out-url'),
      }).then((response) => {
        if (response.data.success) {
          // If query was successful...
          // Set the action URL
          this.$refs.logoutForm.action = response.data.data.url;
          // Set the UUID
          this.$refs.logoutFormUuid.value = response.data.uuid;
          // Set the current URI
          this.$refs.logoutFormCurrentUri.value = window.location.origin + "/trigger/?session=reload";
          // Submit the form
          this.$refs.logoutForm.submit()

        } else {
          // Our query was unsuccessful
          console.error('An error occurred while fetching the sign out form details.');
        }
      }).catch(() => {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('notifications.failedToFetchLogoutUrl'),
          icon: 'report_problem'
        })
      })
    }
  }
}
</script>
