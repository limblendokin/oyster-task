<template>
  <div>
    <a-alert v-if="errorMessage.length" type="error" $:message="errorMessage" banner />
  </div>
</template>
<script>
export default {
  props:['errorMessage'],
}
</script>