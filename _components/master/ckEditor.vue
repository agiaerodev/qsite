<template>
  <div id="ckEditorComponent" class="relative-position">
    <ck-editor v-model="responseValue"
               :config="configEditor"
               @namespaceloaded="onNamespaceLoaded"
               :ref="`ref-${internalName}`"
               :id="`id-${internalName}`"
    />
    <!--inner loading-->
    <inner-loading :visible="loading" />
  </div>
</template>
<script>
//Components
import CKEditor from '@mayasabha/ckeditor4-vue3';
//Custom Plugins
import pluginCollapsibleItem from 'src/plugins/ckEditorPlugins/collapsibleItem/plugin'
import pluginGrid from 'src/plugins/ckEditorPlugins/grid/plugin'
import pluginEmbed from 'src/plugins/ckEditorPlugins/embed/plugin'
import pluginFa from 'src/plugins/ckEditorPlugins/ckeditorfa-fa6/plugin'
import { eventBus } from 'src/plugins/utils'

/* range 7px to 36px*/
let fontSizes =  Array.from({length: 30}, (_, index) => `${7+index * 1}/${7 +index * 1}px;`)
fontSizes.push('48/48px;72/72px;96/96px;')

export default {
  props: {
    modelValue: {default: ''},
    name: {default: null},
    disk: { default: null },
    toolbarFilters: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue'],
  components: {ckEditor: CKEditor.component},
  watch: {
    modelValue(newValue, oldValue) {
      if (JSON.stringify(newValue) != JSON.stringify(oldValue))
        this.responseValue = this.$clone(newValue)
    },
    responseValue(newValue, oldValue) {
      if (JSON.stringify(newValue) != JSON.stringify(oldValue))
        this.$emit('update:modelValue', this.$clone(newValue))

    }
  },
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      responseValue: '',
      loading: false,
    }
  },
  computed: {
    internalName(){
      return this.name || this.$uid()
    },
    //default disk
    mediaDisk() {
      return this.disk || this.$getSetting('media::filesystem');
    },
    configEditor() {
      return  {
        allowedContent: true,
        filebrowserBrowseUrl: this.configModules('main.qmedia.moduleName') ? this.$router.resolve({name: 'app.media.select'}).href : null,
        extraPlugins: 'colorbutton,colordialog,justify,collapsibleItem,font,btgrid,simplebox,ckeditorfa',
        embed_provider: '//iframe.ly/api/oembed?url={url}&callback={callback}&api_key=7e0aa12b0cd2c01651346b',
        contentsCss: 'https://site-assets.fontawesome.com/releases/v6.5.1/css/all.css',
        fontSize_sizes: fontSizes.join(''),
        toolbar: this.fullToolbar
      }
    },
    fullToolbar() {
      const masterToolbar = [
        { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
        { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
        { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
        { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar', 'Iframe', 'btgrid', 'collapsibleItem'] },
        { name: 'tools', items: ['Maximize', 'ShowBlocks', 'Source'] },
        { name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', 'RemoveFormat'] },
        { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
        { name: 'colors', items: ['TextColor', 'BGColor'] },
        { name: 'custom', items: ['ckeditorfa'] }
      ];

      if (!this.toolbarFilters || this.toolbarFilters.length === 0) {
        return masterToolbar;
      }

      return masterToolbar.filter(group => {
        if (typeof group === 'string') return false;
        return this.toolbarFilters.includes(group.name);
      });
    },
  },
  methods: {
    init() {
      this.responseValue = this.$clone(this.modelValue)
    },
    //On name space loaded
    onNamespaceLoaded(CKEDITOR) {
      //Load custom plugins
      pluginCollapsibleItem.load(CKEDITOR)
      pluginGrid.load(CKEDITOR);
      pluginEmbed.load(CKEDITOR);
      pluginFa.load(CKEDITOR);
      CKEDITOR.dtd.$removeEmpty['span'] = false;
      //events
      CKEDITOR.on('instanceReady', (event) => {
        this.onPaste(event, CKEDITOR)
      });
    },
    configModules(name) {
      if (!name) return;
      return Boolean(config(name));
    },
    onPaste(event, ckEditor){
      const editor = event.editor;

      const notification = new ckEditor.plugins.notification( editor, {
        message: this.$tr('isite.cms.label.loading'),
        type: 'info'
      } );

      editor.on('paste', (event) => {
        const value = event.data.dataValue
        if(value.includes('img') && value.includes('data:image')){

          const element = ckEditor.dom.element.createFromHtml(value) //ckeditor element to get the src
          const src = element.$.src //get the base64
          event.data.dataValue = ''

          this.uploadImage(src, notification).then((response) => {
            if(response?.relativePath){
              const imgElement = `<img src="${response.relativePath}"/>`
              const element = ckEditor.dom.element.createFromHtml(imgElement)
              editor.insertElement(element)
              notification.hide();
            }
          })

        }
      })
    },
    //upload image
    async uploadImage(data, notification) {
      /* create a file from base64 data and adds to form*/
      return new Promise((resolve, reject) => {
        this.cropper(data).then((response) => {
          //this.loading = true
          if(response){
            notification.show();

            fetch(response.base64) //get blob file from cropper base64
              .then(res => res.blob())
              .then(blob => {

                let fileData = new FormData();
                fileData.append('parent_id', 0);
                fileData.append('disk', this.mediaDisk);
                //create a file from blob data to be append
                const file = new File([blob], "ckeditor.png", { type: 'image/png' });
                fileData.append('file', file)

                this.$crud.post('apiRoutes.qmedia.files', fileData).then(response => {
                  this.loading = false
                  resolve(response.data)

                }).catch((error) => {
                  console.log(error)
                  notification.hide();
                  this.loading = false
                  resolve(false)
                });
              })
          } else {
            //canceled
            resolve(false)
          }
        })
      })
    },

    cropper(base64){
      return new Promise((resolve, reject) => {
        eventBus.emit('master.cropper.image', {
          src: base64,
          type: 'image/png',
          ratio: 'free',
          callBack: async (fileCropped) => {
            resolve(fileCropped)
          }
        })
      })
    }
  }
}
</script>
<style lang="scss">
#ckEditorComponent {
  .btn-content-toolbar {
    background-size: 16px;
    height: 16px;
    width: 16px;
  }

  #iconToolbarCollapsibleitem {
    background-image: url("src/plugins/ckEditorPlugins/collapsibleItem/collapsibleitem.png");
  }

  #iconToolbarGrid {
    background-image: url("src/plugins/ckEditorPlugins/grid/grid.png");
  }

  #iconToolbarEmbed {
    background-image: url("src/plugins/ckEditorPlugins/embed/embed.png");
  }

  .cke_button__ckeditorfa_icon {
    background-image: url("src/plugins/ckEditorPlugins/ckeditorfa-fa6/icons/ckeditorfa.png") !important;
  }
}

/* ckeditor-fa pluging */
#ckeditor-fa-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

#ckeditor-fa-icons {
  text-align: center;
  white-space: normal;
  width: 100%;
  height: 400px;
  padding-top: 20px;
  padding-bottom: 20px;
  overflow: auto;
  background-color: #f0f1f3;
}

#ckeditor-fa-icons button {
  display: inline-block;
  width: 100px;
  padding: 5px;
  text-align: center;
  vertical-align: top;
  background-color: #ffffff;
  border-radius: 4px !important;
  border: 2px solid #f0f1f3 !important;
}

#ckeditor-fa-icons button:hover {
  /* transform: scale(1.2) */
  transition: all 0.1s ease-in-out;
  border: 2px solid $primary !important;
}

#ckeditor-fa-icons button span {
  font-size: 28px;
  display: block;
  text-align: center;
}

#ckeditor-fa-icons button p {
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ckeditor-fa-select {
  display: block !important;
}

</style>
