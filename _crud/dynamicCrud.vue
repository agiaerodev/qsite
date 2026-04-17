<template>
  <modalBuildFilter criteria="concierges" fieldKey="key" />
</template>

<script>
import storeModalBuildFilter from 'modules/qsite/_components/master/modalBuildFilter/stores';
import modalBuildFilter from 'modules/qsite/_components/master/modalBuildFilter/index.vue';

export default {
  components: { modalBuildFilter },
  data() {
    return {
      crudId: this.$uid(),
    };
  },

  computed: {
    crudData() {
      return {
        crudId: this.crudId,
        apiRoute: 'apiRoutes.qsite.cruds',
        create: {
          title: 'New Crud',
        },

        read: {
          columns: [
            { name: 'id', label: 'Id', field: 'id', align: 'left' },
            { name: 'key', label: 'Key', field: 'key', align: 'left' },
            { name: 'title', label: 'Title', field: 'title', align: 'left' },
            {
              name: 'apiRoute',
              label: 'Api Route',
              field: 'apiRoute',
              align: 'left',
            },
            {
              name: 'createTitle',
              label: 'Create Title',
              field: 'createTitle',
              align: 'left',
            },
            {
              name: 'updateTitle',
              label: 'Update Title',
              field: 'updateTitle',
              align: 'left',
            },
            {
              name: 'canDelete',
              label: 'Can Delete',
              field: 'canDelete',
              align: 'left',
            },
            {
              name: 'permission',
              label: 'Permission',
              field: 'permission',
              align: 'left',
            },
            { name: 'actions', label: 'Actions', align: 'left' },
          ],
          filters: {},
          actions: [
            {
              icon: 'fa-light fa-filter',
              label: 'Build Filter',
              action: async (item) => {
                storeModalBuildFilter.showModal = true;
                storeModalBuildFilter.criteria = item.key;
                storeModalBuildFilter.fieldKey = 'key';
              },
            },
          ],
        },

        update: {
          title: 'Update Crud',
        },

        delete: true,

        formLeft: {
          key: {
            value: null,
            type: 'input',
            props: {
              label: 'Key',
              rules: [
                (val) => !!val || this.$tr('isite.cms.message.fieldRequired'),
              ],
            },
          },

          title: {
            value: null,
            type: 'input',
            props: {
              label: 'Title',
              rules: [],
            },
          },

          apiRoute: {
            value: null,
            type: 'input',
            props: {
              label: 'Api Route',
              rules: [],
            },
          },

          createTitle: {
            value: null,
            type: 'input',
            props: {
              label: 'Create Title',
              rules: [],
            },
          },

          createMethod: {
            value: null,
            type: 'input',
            props: {
              label: 'Create Method',
              rules: [],
            },
          },

          updateTitle: {
            value: null,
            type: 'input',
            props: {
              label: 'Update Title',
              rules: [],
            },
          },

          updateMethod: {
            value: null,
            type: 'input',
            props: {
              label: 'Update Method',
              rules: [],
            },
          },

          updateRequestParams: {
            value: null,
            type: 'input',
            props: {
              label: 'Update Request Params',
              rules: [],
            },
          },

          canDelete: {
            value: null,
            type: 'input',
            props: {
              label: 'Can Delete',
              rules: [],
            },
          },

          permission: {
            value: null,
            type: 'input',
            props: {
              label: 'Permission',
              rules: [],
            },
          },
        },
      };
    },
  },
};
</script>
