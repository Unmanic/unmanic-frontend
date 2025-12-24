<template>
  <q-scroll-area
    style="height: 100%;"
    :style="$q.platform.is.mobile ? 'height: calc(100% - 90px); margin-top: 90px; border-right: 1px solid #ddd' : ''">
    <q-list padding>

      <q-item-label header>{{ $t('navigation.settings') }}:</q-item-label>
      <!--START LIBRARY SELECT-->
      <q-item
        clickable
        to="/ui/settings-library"
        v-ripple>
        <q-item-section avatar>
          <q-icon name="account_tree"/>
        </q-item-section>
        <q-item-section>
          {{ $t('navigation.library') }}
        </q-item-section>
      </q-item>
      <!--END LIBRARY SELECT-->

      <!--START WORKERS SELECT-->
      <q-item
        clickable
        to="/ui/settings-workers"
        v-ripple>
        <q-item-section avatar>
          <q-icon name="engineering"/>
        </q-item-section>
        <q-item-section>
          {{ $t('navigation.workers') }}
        </q-item-section>
      </q-item>
      <!--END WORKERS SELECT-->

      <!--START PLUGINS SELECT-->
      <q-item
        clickable
        to="/ui/settings-plugins"
        v-ripple>
        <q-item-section avatar>
          <q-icon name="extension"/>
        </q-item-section>
        <q-item-section>
          {{ $t('navigation.plugins') }}
        </q-item-section>
      </q-item>
      <!--END PLUGINS SELECT-->

      <!--START PLUGINS SELECT-->
      <q-item
        clickable
        to="/ui/settings-link"
        v-ripple>
        <q-item-section avatar>
          <q-icon name="link"/>
        </q-item-section>
        <q-item-section>
          {{ $t('navigation.link') }}
        </q-item-section>
      </q-item>
      <!--END PLUGINS SELECT-->

      <q-separator spaced/>

      <q-item-label header>{{ $t('navigation.interface') }}:</q-item-label>
      <!--START LANGUAGE SELECT-->
      <q-item
        clickable v-ripple>
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

  <PrivacyPolicyDialog ref="privacyPolicyDialogRef"/>
</template>

<script>

import { ref } from "vue";
import unmanicGlobals from "src/js/unmanicGlobals";
import LanguageSwitch from "components/LanguageSwitch";
import PrivacyPolicyDialog from "components/docs/PrivacyPolicyDialog.vue";

export default {
  name: 'DrawerSettingsNav',
  components: { LanguageSwitch, PrivacyPolicyDialog },
  setup() {
    const unmanicSession = ref(null);
    const formAction = ref(null)
    const uuid = ref(null)
    const currentUri = ref(null)
    const privacyPolicyDialogRef = ref(null);

    unmanicGlobals.getUnmanicSession().then((session) => {
      unmanicSession.value = session;
    })

    function showPrivacyPolicyDialog() {
      if (privacyPolicyDialogRef.value) {
        privacyPolicyDialogRef.value.show()
      }
    }

    return {
      unmanicSession,
      formAction,
      uuid,
      currentUri,
      showPrivacyPolicyDialog,
      privacyPolicyDialogRef,
    }
  }
}
</script>
