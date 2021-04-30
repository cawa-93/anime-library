<template>
  <div id="window-controls">
    <button
      id="min-button"
      class="button"
      @click="minimize"
    >
      <win-icon>&#xE921;</win-icon>
    </button>

    <button
      id="max-button"
      class="button"
      @click="toggleMaximizeState"
    >
      <win-icon>
        {{ isMaximized ? '&#xE923;' : '&#xE922;' }}
      </win-icon>
    </button>

    <button
      id="close-button"
      class="button"
      @click="close"
    >
      <win-icon>&#xE8BB;</win-icon>
    </button>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {useElectron} from '/@/use/electron';
import WinIcon from '/@/components/WinIcon.vue';

export default defineComponent({
  name: 'WindowsWindowControls',
  components: {WinIcon},
  setup() {
    const {close, minimize, maximize, unmaximize, onMaximizeChange} = useElectron();

    const isMaximized = ref(false);

    onMaximizeChange((state) => {
      console.log({state});
      isMaximized.value = state;
    });

    const toggleMaximizeState = () => {
      return isMaximized.value ? unmaximize() : maximize();
    };

    return {close, minimize, isMaximized, toggleMaximizeState};
  },
});
</script>

<style scoped>
@import "button.css";

#window-controls {
  display: grid;
  grid-template-columns: repeat(3, 45px);
  position: absolute;
  top: 0;
  right: -1px;
  height: 100%;
  -webkit-app-region: no-drag;
}

.button {
  grid-row: 1 / span 1;
  font-size: 10px;
}

#min-button {
  grid-column: 1;
}

#max-button {
  grid-column: 2;
}

#close-button {
  grid-column: 3;
}

#close-button:hover {
  background: #E81123 !important;
}

#close-button:active {
  background: #F1707A !important;
}

#close-button:active, #close-button:hover {
  color: white;
}
</style>
