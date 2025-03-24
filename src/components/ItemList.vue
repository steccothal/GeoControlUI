<template>
  <ul class="list-group" @click.self="clearSelection">
    <li
      v-for="item in items"
      :key="keyFn(item)"
      class="list-group-item list-group-item-action"
      :class="{ active: selected && keyFn(selected) === keyFn(item) }"
      @click.stop="select(item)"
    >
      {{ displayFn(item) }}
    </li>
  </ul>
</template>

<script lang="ts" setup>
const props = defineProps<{
  items: any[];
  keyFn: (item: any) => string;
  displayFn: (item: any) => string;
}>();

const selected = defineModel<any>("selected");

function select(item: any) {
  selected.value = item;
}

function clearSelection() {
  selected.value = null;
}
</script>
