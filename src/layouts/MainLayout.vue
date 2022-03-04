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

        <div>
          <ThemeSwitch/>
        </div>
      </q-toolbar>

    </q-header>

    <q-drawer
      v-if="$route.meta.showMainNavDrawer"
      v-model="leftMainNavDrawerOpen"
      side="left"
      behavior="mobile"
      overlay elevated>
      <DrawerMainNav/>
    </q-drawer>

    <q-drawer
      v-if="$route.meta.showSettingsDrawer"
      v-model="leftSettingsDrawerOpen"
      side="left"
      :behavior="$q.platform.is.mobile ? 'mobile' : 'desktop'"
      :overlay="!!$q.platform.is.mobile"
      elevated>
      <DrawerSettingsNav/>
    </q-drawer>

    <q-drawer
      v-if="$route.meta.showDataPanelsDrawer"
      v-model="leftDataPanelsDrawerOpen"
      side="left"
      :behavior="$q.platform.is.mobile ? 'mobile' : 'desktop'"
      :overlay="!!$q.platform.is.mobile"
      elevated>
      <DrawerDataPanelsNav/>
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
import { ref } from 'vue';
import DrawerMainNav from "components/DrawerMainNav";
import FooterData from "components/FooterData";
import DrawerSettingsNav from "components/DrawerSettingsNav";
import { useQuasar } from "quasar";
import DrawerDataPanelsNav from "components/DrawerDataPanelsNav";
import ThemeSwitch from "components/ThemeSwitch";

export default {
  components: { DrawerDataPanelsNav, DrawerMainNav, DrawerSettingsNav, FooterData, ThemeSwitch },
  setup() {
    const $q = useQuasar();

    const leftMainNavDrawerOpen = ref(false)
    const leftSettingsDrawerOpen = ref(false)
    const leftDataPanelsDrawerOpen = ref(false)

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

    return {
      leftMainNavDrawerOpen,
      leftSettingsDrawerOpen,
      leftDataPanelsDrawerOpen,
      toggleMainNavDrawer,
      toggleSettingsDrawer,
      toggleDataPanelsDrawer
    }
  }
}
</script>

<style>

</style>
