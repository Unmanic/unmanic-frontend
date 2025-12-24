<template>
  <div class="column fit drawer-background">
    <!-- Profile Section -->
    <div :class="{'q-pt-xl' : !$q.screen.gt.sm}">
      <DrawerUserProfileHeader/>
    </div>

    <!-- Scrollable Navigation -->
    <q-scroll-area class="col">
      <q-list padding>

        <!--START DASHBOARD SELECT-->
        <q-item
          clickable
          to="/ui/dashboard"
          v-ripple>
          <q-item-section avatar>
            <q-icon name="dashboard"/>
          </q-item-section>
          <q-item-section>
            {{ $t('navigation.dashboard') }}
          </q-item-section>
        </q-item>
        <!--END DASHBOARD SELECT-->
        <!--START SETTINGS SELECT-->
        <q-item
          clickable
          to="/ui/settings-library"
          v-ripple>
          <q-item-section avatar>
            <q-icon name="settings"/>
          </q-item-section>
          <q-item-section>
            {{ $t('navigation.settings') }}
          </q-item-section>
        </q-item>
        <!--END SETTINGS SELECT-->
        <!--START DATA PANELS SELECT-->
        <q-item
          clickable
          to="/ui/data-panels"
          v-ripple>
          <q-item-section avatar>
            <q-icon name="insights"/>
          </q-item-section>
          <q-item-section>
            {{ $t('navigation.dataPanels') }}
          </q-item-section>
        </q-item>
        <!--END DATA PANELS SELECT-->

        <q-separator spaced/>


        <q-item-label header>{{ $t('navigation.account') }}:</q-item-label>
        <!--START LOGOUT-->
        <q-item
          v-if="unmanicSession && unmanicSession.level && unmanicSession.level > 0 && unmanicSession.level !== 9"
          clickable
          @click="logoutSubmit"
          v-ripple>
          <q-item-section avatar>
            <q-icon name="logout"/>
          </q-item-section>
          <q-item-section>
            {{ $t('navigation.logout') }}
          </q-item-section>
        </q-item>
        <!--END LOGOUT-->
        <!--START LOGIN-->
        <q-item
          v-else
          clickable
          @click="showLogin"
          v-ripple>
          <q-item-section avatar>
            <q-icon name="login"/>
          </q-item-section>
          <q-item-section>
            {{ $t('navigation.login') }}
          </q-item-section>
        </q-item>
        <!--END LOGIN-->

        <q-separator spaced/>


        <q-item-label header>{{ $t('navigation.interface') }}:</q-item-label>
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

        <q-separator spaced/>


        <q-item-label header>{{ $t('navigation.documentation') }}:</q-item-label>
        <!--START SUPPORT SELECT-->
        <q-item
          clickable
          to="/ui/settings-support"
          v-ripple>
          <q-item-section avatar>
            <q-icon name="fa-regular fa-life-ring"/>
          </q-item-section>
          <q-item-section>
            {{ $t('navigation.helpAndSupport') }}
          </q-item-section>
        </q-item>
        <!--END SUPPORT SELECT-->

        <!--START PRIVACY POLICY-->
        <q-item
          clickable
          @click="showPrivacyPolicyDialog"
          v-ripple>
          <q-item-section avatar>
            <q-icon name="o_shield"/>
          </q-item-section>
          <q-item-section>
            {{ $t('headers.privacyPolicy') }}
          </q-item-section>
        </q-item>
        <!--END PRIVACY POLICY-->

      </q-list>
    </q-scroll-area>

    <!-- Footer Section (Mobile Only) -->
    <div class="lt-md">
      <q-img src="~assets/bg-design-3.png" style="height: 80px">
        <div class="absolute-full footer-gradient"></div>
        <div class="absolute-full bg-transparent text-white row items-center q-px-md">
          <FooterData/>
        </div>
      </q-img>
    </div>

    <!-- Dialogs -->
    <PrivacyPolicyDialog ref="privacyPolicyDialogRef"/>
  </div>
</template>

<script>

import DrawerUserProfileHeader from "components/drawers/partials/DrawerUserProfileHeader.vue";
import LanguageSwitch from "components/LanguageSwitch";
import { ref } from "vue";
import unmanicGlobals from "src/js/unmanicGlobals";
import { useQuasar } from "quasar";
import FooterData from "components/FooterData";
import LoginDialog from "components/LoginDialog";
import PrivacyPolicyDialog from "components/docs/PrivacyPolicyDialog.vue";

export default {
  name: 'DrawerMainNav',
  components: { DrawerUserProfileHeader, FooterData, LanguageSwitch, PrivacyPolicyDialog },
  setup() {
    const $q = useQuasar();
    const unmanicSession = ref(null);
    const privacyPolicyDialogRef = ref(null);

    unmanicGlobals.getUnmanicSession().then((session) => {
      unmanicSession.value = session;
    })

    function showPrivacyPolicyDialog() {
      if (privacyPolicyDialogRef.value) {
        privacyPolicyDialogRef.value.show()
      }
    }

    function showLogin() {
      $q.dialog({
        component: LoginDialog,
        componentProps: {},
      }).onOk((payload) => {
      }).onDismiss(() => {
      })
    }

    return {
      unmanicSession,
      showPrivacyPolicyDialog,
      privacyPolicyDialogRef,

      showLogin,
    }
  },
  methods: {
    logoutSubmit() {
      unmanicGlobals.logout(this.$t)
    }
  }
}
</script>

<style scoped>
.footer-gradient {
  background: linear-gradient(to top, #002e5c, rgba(0, 46, 92, 0.7)) !important;
}
</style>
