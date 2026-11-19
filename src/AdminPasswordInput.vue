<script setup lang="ts">
import { ref, useId } from 'vue'

defineProps<{
  label: string
  autocomplete: 'current-password' | 'new-password'
  minlength?: number
}>()

const password = defineModel<string>({ required: true })
const inputId = useId()
const visible = ref(false)
</script>

<template>
  <div class="admin-password-field">
    <label :for="inputId">{{ label }}</label>
    <div class="admin-password-row">
      <input
        :id="inputId"
        v-model="password"
        :type="visible ? 'text' : 'password'"
        :autocomplete="autocomplete"
        :minlength="minlength"
        required
      />
      <button
        type="button"
        :aria-label="`${visible ? '隱藏' : '顯示'}「${label}」`"
        :aria-controls="inputId"
        @click="visible = !visible"
      >{{ visible ? '隱藏' : '顯示' }}</button>
    </div>
  </div>
</template>
