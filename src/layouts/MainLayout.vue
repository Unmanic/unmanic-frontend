<template>
  <q-layout view="hHh lpR fFf">

    <q-header reveal elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn
          v-if="$route.meta.showDrawer"
          dense
          flat
          round
          icon="menu"
          @click="toggleLeftDrawer"/>
        <q-btn
          v-if="!$route.meta.showDrawer"
          dense
          flat
          round
          @click="$router.push('/unmanic-dashboard')"
          icon="arrow_back">
        </q-btn>

        <q-toolbar-title>
          <q-avatar rounded size="2rem" font-size="82px">
            <img src="~assets/unmanic-logo-white.png">
          </q-avatar>
        </q-toolbar-title>
      </q-toolbar>

    </q-header>

    <q-drawer
      v-if="$route.meta.showDrawer"
      v-model="leftDrawerOpen"
      side="left"
      behavior="mobile"
      overlay elevated>
      <Drawer/>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

    <q-footer
      elevated
      class="bg-primary text-white gt-sm">
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
import Drawer from "components/Drawer";
import FooterData from "components/FooterData";

export default {
  components: { Drawer, FooterData },
  setup() {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
}
</script>

<style>

</style>
