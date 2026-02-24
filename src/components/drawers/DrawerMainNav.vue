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
        <!--START CENTRAL LINK (MOBILE ONLY)-->
        <q-item
          v-if="unmanicSession && unmanicSession.level > 1 && unmanicSession.level !== 9"
          clickable
          tag="a"
          href="https://central.unmanic.app/"
          target="_blank"
          rel="noopener"
          v-ripple>
          <q-item-section avatar>
            <q-icon name="launch"/>
          </q-item-section>
          <q-item-section>
            {{ $t('components.sharedLinkDropdown.centralLink') }}
          </q-item-section>
        </q-item>
        <!--END CENTRAL LINK (MOBILE ONLY)-->

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
        <!--START THEME SELECT (MOBILE ONLY)-->
        <q-item v-if="$q.screen.lt.sm">
          <q-item-section avatar>
            <q-icon name="palette"/>
          </q-item-section>
          <q-item-section>
            {{ $t('navigation.theme') }}
          </q-item-section>
          <q-item-section side>
            <ThemeSwitch/>
          </q-item-section>
        </q-item>
        <!--END THEME SELECT (MOBILE ONLY)-->

        <q-separator spaced/>

        <div v-if="$q.screen.lt.sm && unmanicSession && unmanicSession.level > 1 && unmanicSession.level !== 9">
          <q-item-label header>{{ $t('navigation.installations') }}:</q-item-label>
          <q-item>
            <q-item-section>
              <SharedLinkDropdown/>
            </q-item-section>
          </q-item>
          <q-separator spaced/>
        </div>


        <q-item-label header>{{ $t('navigation.documentation') }}:</q-item-label>
        <!--START SUPPORT SELECT-->
        <q-item
          clickable
          @click="showHelpSupportDialog"
          v-ripple>
          <q-item-section avatar>
            <q-icon name="fa-regular fa-life-ring"/>
          </q-item-section>
          <q-item-section>
            {{ $t('navigation.helpAndSupport') }}
          </q-item-section>
        </q-item>
        <!--END SUPPORT SELECT-->

        <!--START APPLICATION LOGS-->
        <q-item
          clickable
          @click="showApplicationLogsDialog"
          v-ripple>
          <q-item-section avatar>
            <q-icon name="article"/>
          </q-item-section>
          <q-item-section>
            {{ $t('navigation.applicationLogs') }}
          </q-item-section>
        </q-item>
        <!--END APPLICATION LOGS-->

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
    <HelpSupportDialog ref="helpSupportDialogRef"/>
    <ApplicationLogsDialog ref="applicationLogsDialogRef"/>
    <PrivacyPolicyDialog ref="privacyPolicyDialogRef"/>
    <LoginDialog ref="loginDialogRef"/>
  </div>
</template>

<script>

import DrawerUserProfileHeader from "components/drawers/partials/DrawerUserProfileHeader.vue";
import LanguageSwitch from "components/LanguageSwitch";
import ThemeSwitch from "components/ThemeSwitch";
import SharedLinkDropdown from "components/SharedLinkDropdown";
import { ref } from "vue";
import unmanicGlobals from "src/js/unmanicGlobals";
import FooterData from "components/FooterData";
import LoginDialog from "components/drawers/partials/LoginDialog.vue";
import PrivacyPolicyDialog from "components/docs/PrivacyPolicyDialog.vue";
import HelpSupportDialog from "components/docs/HelpSupportDialog.vue";
import ApplicationLogsDialog from "components/docs/ApplicationLogsDialog.vue";

export default {
  name: 'DrawerMainNav',
  components: {
    DrawerUserProfileHeader,
    FooterData,
    LanguageSwitch,
    ThemeSwitch,
    SharedLinkDropdown,
    HelpSupportDialog,
    ApplicationLogsDialog,
    PrivacyPolicyDialog,
    LoginDialog
  },
  setup() {
    const unmanicSession = ref(null);
    const privacyPolicyDialogRef = ref(null);
    const helpSupportDialogRef = ref(null);
    const applicationLogsDialogRef = ref(null);
    const loginDialogRef = ref(null);

    unmanicGlobals.getUnmanicSession().then((session) => {
      unmanicSession.value = session;
    })

    function showPrivacyPolicyDialog() {
      if (privacyPolicyDialogRef.value) {
        privacyPolicyDialogRef.value.show()
      }
    }

    function showHelpSupportDialog() {
      if (helpSupportDialogRef.value) {
        helpSupportDialogRef.value.show()
      }
    }

    function showApplicationLogsDialog() {
      if (applicationLogsDialogRef.value) {
        applicationLogsDialogRef.value.show()
      }
    }

    function showLogin() {
      if (loginDialogRef.value) {
        loginDialogRef.value.show()
      }
    }

    return {
      unmanicSession,
      showPrivacyPolicyDialog,
      showHelpSupportDialog,
      showApplicationLogsDialog,
      privacyPolicyDialogRef,
      helpSupportDialogRef,
      applicationLogsDialogRef,
      loginDialogRef,

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
