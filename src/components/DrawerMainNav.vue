<template>
  <q-scroll-area
    style="height: calc(100% - 240px); margin-top: 150px; margin-bottom: 90px;">
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
        v-if="unmanicSession && unmanicSession.level && unmanicSession.level > 0"
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
      <!--END LOGOUT-->

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

  <DrawerAvatar/>

  <q-img class="absolute-bottom lt-md" src="~assets/bg-md1.jpg" style="height: 80px">
    <div class="absolute-top bg-transparent text-white">
      <div class="q-pl-md">
        <FooterData/>
      </div>
    </div>
  </q-img>
</template>

<script>

import DrawerAvatar from "components/DrawerAvatar.vue";
import LanguageSwitch from "components/LanguageSwitch";
import { ref } from "vue";
import unmanicGlobals from "src/js/unmanicGlobals";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import FooterData from "components/FooterData";
import MarkdownDialog from "components/MarkdownDialog";
import { markdownToHTML } from "src/js/markupParser";
import LoginDialog from "components/LoginDialog";

export default {
  name: 'DrawerMainNav',
  components: { DrawerAvatar, FooterData, LanguageSwitch },
  setup() {
    const $q = useQuasar();
    const { t: $t } = useI18n();
    const unmanicSession = ref(null);

    unmanicGlobals.getUnmanicSession().then((session) => {
      unmanicSession.value = session;
    })

    function showPrivacyPolicyDialog() {

      unmanicGlobals.getUnmanicPrivacyPolicy().then((privacyPolicy) => {
        console.log(privacyPolicy)
        let privacyPolicyHtml = markdownToHTML(privacyPolicy);
        console.log(privacyPolicyHtml)
        $q.dialog({
          component: MarkdownDialog,
          // props forwarded to your custom component
          componentProps: {
            dialogHeader: $t('headers.privacyPolicy'),
            dialogContent: privacyPolicyHtml
          }
        }).onDismiss(() => {
        })
      })
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
