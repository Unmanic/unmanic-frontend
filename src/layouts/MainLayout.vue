<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="header-background text-white" height-hint="98">
      <q-toolbar>

        <!--SHOW DRAWER MENU BUTTON-->
        <q-btn
          v-if="$route.meta.showMainNavDrawer"
          dense
          flat
          round
          icon="menu"
          @click="toggleMainNavDrawer"/>

        <!--SHOW BACK BUTTON-->
        <q-btn
          v-if="!$route.meta.showMainNavDrawer"
          dense
          flat
          round
          @click="$router.go(-1)"
          icon="arrow_back">
        </q-btn>

        <!--SHOW HOME BUTTON-->
        <q-btn
          v-if="$route.meta.showHome"
          dense
          flat
          round
          @click="$router.push('/ui/dashboard')"
          icon="home">
        </q-btn>

        <!--SHOW SETTINGS MENU BUTTON-->
        <q-btn
          v-if="$route.meta.showSettingsDrawer && $q.platform.is.mobile"
          dense
          flat
          round
          icon="menu_open"
          @click="toggleSettingsDrawer"/>

        <!--SHOW SETTINGS MENU BUTTON-->
        <q-btn
          v-if="$route.meta.showDataPanelsDrawer && $q.platform.is.mobile"
          dense
          flat
          round
          icon="menu_open"
          @click="toggleDataPanelsDrawer"/>

        <q-toolbar-title>
          <q-avatar rounded size="2rem" font-size="82px">
            <img src="~assets/unmanic-logo-white.png">
          </q-avatar>
        </q-toolbar-title>

        <q-space/>

        <div>
          <ThemeSwitch/>
        </div>

        <!-- TODO: Enable notifications for mobile -->
        <div
          v-if="!$q.platform.is.mobile"
          class="q-gutter-sm row items-center no-wrap">
          <q-btn
            dense
            flat
            round
            icon="notifications"
            @click="toggleNotificationsDrawer">
            <q-badge
              v-if="notificationsCount > 0"
              color="red" text-color="white" floating>
              {{ notificationsCount }}
            </q-badge>
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>

    </q-header>

    <q-drawer
      v-if="$route.meta.showMainNavDrawer"
      v-model="leftMainNavDrawerOpen"
      side="left"
      :behavior="$q.platform.is.mobile ? 'mobile' : 'desktop'"
      :overlay="$q.platform.is.mobile ? true : false"
       elevated>
      <DrawerMainNav/>
    </q-drawer>

    <q-drawer
      v-if="$route.meta.showSettingsDrawer"
      v-model="leftSettingsDrawerOpen"
      side="left"
      :behavior="$q.platform.is.mobile ? 'mobile' : 'desktop'"
      elevated>
      <DrawerSettingsNav/>
    </q-drawer>

    <q-drawer
      v-if="$route.meta.showDataPanelsDrawer"
      v-model="leftDataPanelsDrawerOpen"
      side="left"
      :behavior="$q.platform.is.mobile ? 'mobile' : 'desktop'"
      elevated>
      <DrawerDataPanelsNav/>
    </q-drawer>

    <!-- TODO: Enable notifications for mobile -->
    <q-drawer
      v-if="!$q.platform.is.mobile"
      v-model="rightNotificationsDrawerOpen"
      side="right"
      :width="650"
      :overlay="$route.meta.showMainNavDrawer"
      :behavior="$q.platform.is.mobile ? 'mobile' : 'desktop'"
      elevated>
      <DrawerNotifications/>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer
      elevated
      class="footer-background text-white gt-sm">
      <q-toolbar>
        <q-toolbar-title>
          <FooterData/>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue';
import DrawerMainNav from "components/DrawerMainNav";
import FooterData from "components/FooterData";
import DrawerSettingsNav from "components/DrawerSettingsNav";
import { useQuasar } from "quasar";
import DrawerDataPanelsNav from "components/DrawerDataPanelsNav";
import ThemeSwitch from "components/ThemeSwitch";
import DrawerNotifications from "components/DrawerNotifications";
import unmanicGlobals from "src/js/unmanicGlobals";

export default {
  components: { DrawerDataPanelsNav, DrawerMainNav, DrawerNotifications, DrawerSettingsNav, FooterData, ThemeSwitch },
  setup() {
    const $q = useQuasar();

    let reloadInterval = null;

    const leftMainNavDrawerOpen = ref(false)
    const leftSettingsDrawerOpen = ref(false)
    const leftDataPanelsDrawerOpen = ref(false)
    const rightNotificationsDrawerOpen = ref(false)

    const notificationsCount = ref(null)

    if (!$q.platform.is.mobile) {
      leftSettingsDrawerOpen.value = true;
      leftDataPanelsDrawerOpen.value = true;
    }

    function toggleMainNavDrawer() {
      leftMainNavDrawerOpen.value = !leftMainNavDrawerOpen.value
    }

    function toggleSettingsDrawer() {
      leftSettingsDrawerOpen.value = !leftSettingsDrawerOpen.value
    }

    function toggleDataPanelsDrawer() {
      leftDataPanelsDrawerOpen.value = !leftDataPanelsDrawerOpen.value
    }

    function toggleNotificationsDrawer() {
      rightNotificationsDrawerOpen.value = !rightNotificationsDrawerOpen.value
    }

    function getNotificationsCount() {
      let notificationsList = unmanicGlobals.getUnmanicNotifications();
      notificationsCount.value = notificationsList.length;
    }

    onMounted(() => {
      // If the reloadInterval has not yet been set
      if (reloadInterval === null) {
        // Set the interval to refresh every second
        reloadInterval = setInterval(() => {
          getNotificationsCount();
        }, 1000);
      }
    })

    onUnmounted(() => {
      if (reloadInterval !== null) {
        clearInterval(reloadInterval);
      }
    })

    return {
      leftMainNavDrawerOpen,
      leftSettingsDrawerOpen,
      leftDataPanelsDrawerOpen,
      rightNotificationsDrawerOpen,
      toggleMainNavDrawer,
      toggleSettingsDrawer,
      toggleDataPanelsDrawer,
      toggleNotificationsDrawer,

      notificationsCount
    }
  }
}
</script>

<style>

</style>
