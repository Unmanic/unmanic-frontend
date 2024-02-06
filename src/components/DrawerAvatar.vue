<template>
  <q-img class="absolute-top" src="~assets/bg-md1.jpg" style="height: 150px">
    <div
      class="absolute-top-right bg-transparent"
      :style="unmanicSession === null || unmanicSession.level === 0 ? 'top:30px;width:100%;' : 'top:5px;width:50%;'">
      <div
        v-if="unmanicSession === null || unmanicSession.level < 2"
        class="float-right">
        <q-btn
          @click="supportProject()"
          color="secondary">
          <q-img class="support-btn-img" width="2em" src="~assets/coffee-btn-image.png"/>
          <div>{{ $t('headers.supportFutureDevelopment') }}</div>
        </q-btn>
      </div>
    </div>
    <div class="absolute-bottom bg-transparent" style="width: 50%;">
      <q-avatar
        v-if="unmanicSession && unmanicSession.level && unmanicSession.level > 0"
        size="56px" class="q-mb-sm">
        <q-img :src="unmanicSession.picture_uri"/>
      </q-avatar>
      <div
        v-if="unmanicSession && unmanicSession.level && unmanicSession.level > 0"
        class="text-weight-bold">
        {{ unmanicSession.name }}
      </div>
      <!--<div>{{ unmanicSession.email }}</div>-->
    </div>
  </q-img>
</template>

<script>

import { ref } from "vue";
import unmanicGlobals from "src/js/unmanicGlobals";
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const { t: $t } = useI18n();

    const unmanicSession = ref(null);

    unmanicGlobals.getUnmanicSession().then((session) => {
      unmanicSession.value = session;
    })

    const supportProject = function () {
      if (typeof unmanicSession.value.level !== 'undefined' && unmanicSession.value.level === 0) {
        // Login first
        console.debug("Calling login before support")
        unmanicGlobals.loginWithPatreon($t)
      } else if (typeof unmanicSession.value.level !== 'undefined' && unmanicSession.value.level > 0) {
        // Redirect to support link
        console.debug("Calling support link redirect")
        unmanicGlobals.sponsorProject($t)
      }
    }

    return {
      unmanicSession,
      supportProject
    }
  }
}
</script>

<style>

.support-btn-img {
  display: initial !important;
  content: url('~assets/coffee-btn-image.png')
}

.support-btn-img {
  display: initial;
  animation: coffee-wiggle 3s infinite;
}

@keyframes coffee-wiggle {
  0% {
    transform: rotate(0) scale(1)
  }
  2%, 6%, 10%, 14%, 18% {
    transform: translate3d(-2px, 0, 0);
  }
  4%, 8%, 12%, 16% {
    transform: translate3d(2px, 0, 0);
  }
  20% {
    transform: translate3d(0px, 0, 0);
  }
  60% {
    transform: rotate(0) scale(1);
  }
  75% {
    transform: rotate(0) scale(1.12);
  }
  80% {
    transform: rotate(0) scale(1.1);
  }
  84% {
    transform: rotate(-10deg) scale(1.3);
  }
  88% {
    transform: rotate(10deg) scale(1.3);
  }
  92% {
    transform: rotate(-10deg) scale(1.3);
  }
  96% {
    transform: rotate(10deg) scale(1.3);
  }
  100% {
    transform: rotate(0) scale(1);
  }
}

</style>
