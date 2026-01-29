<template>
  <div v-if="permisionComments.index" class="tw-max-w-4xl tw-mx-auto tw-antialiased">
    <div>
      <q-list dense class="list-comments">
        <q-item
          class="tw-mb-8 tw-pb-4 tw-border-b tw-border-gray-100"
          style="padding: 0px !important"
          v-if="permisionComments.create"
        >
          <q-item-section top avatar>
            <q-avatar size="42px" class="tw-shadow-sm tw-border-2 tw-border-white">
              <img :src="`${dataBase.avatar}`" />
            </q-avatar>
          </q-item-section>

          <q-item-section v-if="!dataBase.active" class="tw-mr-2">
            <q-card
              flat
              class="tw-rounded-2xl tw-border tw-border-gray-200 tw-bg-white hover:tw-border-primary/50 tw-transition-all tw-duration-300 tw-cursor-pointer group"
              @click="activeText()"
            >
              <q-card-section
                class="tw-py-3 tw-px-4 text-grey-6 tw-flex tw-items-center tw-justify-between"
                :title="i18n.tr(`isite.cms.label.edit`)"
              >
                <div v-html="textPlaceholder" class="tw-text-sm" />
                <q-icon name="fa-light fa-pen" size="xs" class="group-hover:tw-text-primary tw-opacity-0 group-hover:tw-opacity-100 tw-transition-all" />
              </q-card-section>
            </q-card>
          </q-item-section>

          <q-item-section class="tw-bg-white tw-rounded-2xl tw-shadow-sm tw-border tw-border-gray-100 tw-p-4" v-else>
            <div v-if="!loadingComment">
              <CKEditor v-model="dataBase.text" :config="editorConfig" class="modern-editor" />
              <div>
                <dynamic-field :field="files" class="tw-py-2 tw-hidden" />
              </div>
              <div class="flex justify-between tw-mt-4">
                <div class="tw-space-x-3">
                  <q-btn
                    :loading="dataBase.loading"
                    :disable="dataBase.text == ''"
                    @click="addComment()"
                    unelevated
                    rounded
                    size="md"
                    :label="i18n.tr(`isite.cms.label.save`)"
                    color="primary"
                    no-caps
                    class="tw-px-6"
                  />
                  <q-btn
                    flat
                    round
                    size="sm"
                    @click="cancelText()"
                    icon="fa fa-close"
                    color="grey-7"
                    class="tw-bg-gray-100"
                  />
                </div>
              </div>
            </div>
            <div v-if="loadingComment" class="tw-py-12 tw-text-center">
              <q-spinner color="primary" size="2.5em" :thickness="3" />
            </div>
          </q-item-section>
        </q-item>

        <q-item v-if="permisionComments.index" class="tw-p-0">
          <q-item-section v-if="!loading">
            <q-timeline color="primary" class="tw-px-2">

              <q-timeline-entry
                v-for="(item, index, itemKey) in comments"
                :key="itemKey"
                :icon="item.icon ? item.icon : 'fa-regular fa-comment'"
                :color="item.color || 'primary'"
                class="tw-pb-6"
              >
                <div class="tw-group tw-relative tw-p-4 tw-rounded-2xl tw-bg-white tw-border tw-border-gray-100 tw-shadow-sm hover:tw-shadow-md tw-transition-all tw-duration-300">
                  <div>
                    <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
                      <h4 class="tw-text-sm tw-m-0 tw-flex tw-items-center tw-gap-2">
                          <span v-if="item.userProfile && !Boolean(item.internal || item.isInternal)" class="tw-font-bold tw-text-gray-800">
                            {{ item.userProfile.fullName }}
                          </span>
                        <small class="tw-text-gray-400 tw-font-normal">
                          {{ formatDate(item.updatedAt|| item.createdAt) }}
                        </small>
                      </h4>

                      <q-btn
                        flat
                        round
                        v-if="permisionComments.destroy && !Boolean(item.internal || item.isInternal)"
                        class="tw-text-gray-300 hover:tw-text-red-400 tw-transition-colors"
                        icon="fa-light fa-trash"
                        size="xs"
                        @click="deleteComment(item.id)"
                      >
                        <q-tooltip class="tw-bg-red-500">{{ i18n.tr(`isite.cms.label.delete`) }}</q-tooltip>
                      </q-btn>
                    </div>

                    <CKEditor v-model="item.comment" v-if="item.active" />

                    <div v-else>
                      <div
                        class="tw-relative"
                        :class="{'tw-cursor-pointer group/content': !Boolean(item.internal || item.isInternal) }"
                        @click="!Boolean(item.internal || item.isInternal) ? activeEdit(item.id): null"
                      >
                        <div
                          v-html="item.comment"
                          class="tw-text-gray-700 tw-leading-relaxed tw-text-sm"
                          :class="{'tw-italic tw-text-gray-500': item.internal || item.isInternal}"
                        />
                      </div>
                    </div>

                    <div class="flex justify-between tw-mt-4" v-if="item.active">
                      <div class="tw-space-x-2">
                        <q-btn
                          :disable="item.comment == '' || item.comment == item.textEdit"
                          :loading="item.loading"
                          @click="updateComment('edit', item.id)"
                          unelevated
                          rounded
                          size="sm"
                          :label="i18n.tr(`isite.cms.label.update`)"
                          color="primary"
                          no-caps
                        />
                        <q-btn
                          flat
                          round
                          size="xs"
                          @click="updateComment('cancel', item.id)"
                          icon="fa fa-close"
                          color="grey-6"
                          class="tw-bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </q-timeline-entry>
            </q-timeline>
          </q-item-section>

          <div v-if="loading" class="tw-w-full tw-flex tw-justify-center tw-py-12">
            <q-spinner-dots color="primary" size="3em" />
          </div>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script lang="ts">
import Vue,
{ defineComponent, computed, ref}
from "vue";
import CKEditor from "modules/qsite/_components/master/ckEditor.vue";
import {
  apiRouteDefault,
  commentableTypeDefault,
  permissionsCommentsDefault,
} from "modules/qsite/_components/master/comments/contracts/comments";
import useComments from './uses/useComments'
export default defineComponent({
   components: { CKEditor },
   props: {
    commentableId: {
      type: Number,
      required: true,
    },
    commentableType: {
      type: String,
      default: () => commentableTypeDefault,
    },
    apiRoute: {
      type: String,
      default: () => apiRouteDefault,
    },
    permisionComments: {
      type: String,
      default: () => permissionsCommentsDefault,
    }
  },
  setup(props) {
    return {...useComments(props)}
  },
});
</script>

<style>
.timeline-ctn .q-timeline__dot:after {
  @apply tw-text-gray-500;
  width: 1px;
}
.list-comments .q-timeline__subtitle,
.list-comments .q-timeline__title,
.list-comments .q-btn-dropdown__arrow {
  display: none !important;
}

/* Línea del timeline */
.timeline-ctn .q-timeline__dot::after {
  background-color: #9ca3af; /* gray-400 */
  width: 1px;
}
</style>
