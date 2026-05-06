<template>
  <div class="tw-flex tw-items-center tw-justify-center">
    <!-- Avatar -->
    <div
      class="tw-relative tw-w-12 tw-h-12 tw-cursor-pointer group"
      :class="classComponent"
      @click="handleClick"
    >
      <img
        v-if="url"
        :src="url"
        alt="avatar"
        class="tw-w-12 tw-h-12 tw-rounded-full tw-object-cover tw-border-2 tw-border-white tw-shadow-md tw-transition group-hover:tw-scale-110"
        :class="classComponent"
        @error="onError"
      />

      <!-- fallback -->
      <div
        v-else
        class="tw-w-12 tw-h-12 tw-rounded-full tw-bg-gray-200 tw-flex tw-items-center tw-justify-center tw-text-gray-500 tw-shadow"
        :class="classComponent"
      >
        <i class="fas fa-user"></i>
      </div>

      <!-- overlay hover -->
      <div
        class="tw-absolute tw-inset-0 tw-bg-black/40 tw-rounded-full tw-opacity-0 group-hover:tw-opacity-100 tw-flex tw-items-center tw-justify-center tw-transition"
      >
        <i class="fas fa-eye tw-text-white"></i>
      </div>
    </div>

    <!-- Modal preview -->
    <filePreviewModal
      :model-value="isModalVisible"
      @update:model-value="handleUpdateModal"
      :file="selectedFile"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import useAvatarController from './controller.ts';
import filePreviewModal from '../filePreviewModal';

const props = defineProps({
  url: {
    type: String,
    default: null,
  },
  classComponent: {
    type: String,
    default: '',
  },
});

const fallback = ref(false);

const { isModalVisible, selectedFile, handleClick, handleUpdateModal } =
  useAvatarController(props);

function onError(e) {
  e.target.src = 'https://via.placeholder.com/150';
}
</script>
