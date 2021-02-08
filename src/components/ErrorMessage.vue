<template>
  <a-alert
    v-if="errorMessage.length"
    type="error"
    :message="errorMessage"
    banner
  />
</template>
<script>
export default {
  props: ['errorMessage'],
};
</script>
