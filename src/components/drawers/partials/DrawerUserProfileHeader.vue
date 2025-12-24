<template>
  <div class="drawer-profile">
    <q-img
      src="~assets/bg-design-3.png"
      :style="imageStyle">
      <div class="absolute-full profile-gradient"></div>

      <!-- USER PROFILE -->
      <div class="absolute-top bg-transparent q-pa-md row items-start">
        <q-avatar
          v-if="unmanicSession && unmanicSession.level && unmanicSession.level > 0"
          rounded
          size="56px"
          class="q-mr-sm">
          <q-img :src="unmanicSession.picture_uri"/>
        </q-avatar>
        <div
          v-if="unmanicSession && unmanicSession.level && unmanicSession.level > 0"
          class="text-weight-bold q-pt-xs">
          {{ unmanicSession.name }}
        </div>
      </div>

      <!-- SUPPORT BUTTON -->
      <div class="absolute-bottom bg-transparent">
        <div
          v-if="unmanicSession === null || unmanicSession.level < 2"
          class="float-right q-pr-md">
          <q-btn
            @click="supportProject()"
            color="secondary">
            <q-img class="support-btn-img q-mr-sm" width="1.5em" src="~assets/coffee-btn-image.png"/>
            <div>{{ $t('headers.supportFutureDevelopment') }}</div>
          </q-btn>
        </div>
      </div>
    </q-img>
  </div>
</template>

<script>

import { computed, ref } from "vue";
import unmanicGlobals from "src/js/unmanicGlobals";
import { useI18n } from "vue-i18n";

export default {
  name: 'DrawerUserProfileHeader',
  setup() {
    const { t: $t } = useI18n();

    const unmanicSession = ref(null);

    unmanicGlobals.getUnmanicSession().then((session) => {
      unmanicSession.value = session;
    })

    const imageStyle = computed(() => {
      let height = '90px' // User is logged in
      if (unmanicSession.value === null || unmanicSession.value.level === 0) {
        height = '90px' // User is logged in, on a trial level
      } else if (unmanicSession.value === null || unmanicSession.value.level < 2) {
        height = '150px' // user is logged in, but is not supporting any projects
      }
      return {
        height
      };
    });

    const supportProject = function () {
      const url = 'https://api.unmanic.app/support-auth-api/support'
      console.debug('Opening support link in new window:', url)
      window.open(url, '_blank')
    }

    return {
      unmanicSession,
      supportProject,
      imageStyle
    }
  }
}
</script>

<style>

.support-btn-img {
  display: initial !important;
  content: url('~assets/coffee-btn-image.png')
}

.profile-gradient {
  background: linear-gradient(to bottom, #002e5c, rgba(0, 46, 92, 0.7)) !important;
}

.support-btn-img {
  display: initial;
  animation: coffee-wiggle 13s infinite;
}

@keyframes coffee-wiggle {
  0% {
    transform: rotate(0) scale(1)
  }
  0.5%, 1.5%, 2.5%, 3.5%, 4.5% {
    transform: translate3d(-2px, 0, 0);
  }
  1%, 2%, 3%, 4% {
    transform: translate3d(2px, 0, 0);
  }
  5% {
    transform: translate3d(0px, 0, 0);
  }
  14% {
    transform: rotate(0) scale(1);
  }
  17% {
    transform: rotate(0) scale(1.12);
  }
  18.5% {
    transform: rotate(0) scale(1.1);
  }
  19.5% {
    transform: rotate(-10deg) scale(1.3);
  }
  20.5% {
    transform: rotate(10deg) scale(1.3);
  }
  21.5% {
    transform: rotate(-10deg) scale(1.3);
  }
  22.5% {
    transform: rotate(10deg) scale(1.3);
  }
  23%, 100% {
    transform: rotate(0) scale(1);
  }
}

</style>
