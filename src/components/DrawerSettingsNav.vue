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

      <q-separator spaced/>

      <!--START SUPPORT SELECT-->
      <q-item
        clickable
        to="/ui/settings-support"
        v-ripple>
        <q-item-section avatar>
          <q-icon name="help_outline"/>
        </q-item-section>
        <q-item-section>
          {{ $t('navigation.helpAndSupport') }}
        </q-item-section>
      </q-item>
      <!--END SUPPORT SELECT-->


    </q-list>
  </q-scroll-area>

  <q-img
    v-if="$q.platform.is.mobile"
    class="absolute-top bg-primary"
    style="height: 90px;">
    <div class="absolute-center bg-primary">
      <q-avatar
        rounded
        clickable
        @click="$router.push('/ui/dashboard')"
        size="56px" class="q-mb-sm cursor-pointer">
        <q-img src="~assets/unmanic-logo-white.png"/>
      </q-avatar>
    </div>
  </q-img>

</template>

<script>

import { ref } from "vue";
import unmanicGlobals, { getUnmanicApiUrl } from "src/js/unmanicGlobals";
import axios from "axios";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import MarkdownDialog from "components/MarkdownDialog";
import { markdownToHTML } from "src/js/markupParser";

export default {
  name: 'DrawerSettingsNav',
  components: { },
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

    return {
      unmanicSession,
      formAction,
      uuid,
      currentUri,
      showPrivacyPolicyDialog,
    }
  }
}
</script>
