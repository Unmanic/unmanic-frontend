<template>
  <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
    <q-list padding>

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

      <!--START LOGOUT-->
      <q-item
        clickable
        v-ripple>
        <q-item-section avatar>
          <q-icon name="logout"/>
        </q-item-section>
        <q-item-section>
          Logout
        </q-item-section>
      </q-item>
      <!--END LOGOUT-->

    </q-list>
  </q-scroll-area>

  <Avatar/>
</template>

<script>

import Avatar from "components/Avatar";
import LanguageSwitch from "components/LanguageSwitch";

export default {
  components: { Avatar, LanguageSwitch },
  setup() {
    return {}
  }
}
</script>
