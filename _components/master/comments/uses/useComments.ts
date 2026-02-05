import
{ computed, ref, onBeforeUnmount }
  from "vue";
import {
  CommentModelContract,
  EditorConfigContract,
  apiRouteDefault,
  commentModelConst,
  commentsContract,
  commentableTypeDefault,
  permissionsCommentsDefault,
} from "modules/qsite/_components/master/comments/contracts/comments";
import crud from 'modules/qcrud/_services/baseService'
import { store, i18n, moment, alert, helper, router } from 'src/plugins/utils'
import { useQuasar } from 'quasar';

/**
 * A Vue Composition API function for managing comments functionality.
 * @param {object} props - The properties received by the component.
 * @returns {object} An object containing methods and data related to comments.
 */
export default function useComments(props: any) {
  const { hasAccess } = store
  const $q = useQuasar()
  const dataComment: any = ref({
    edit: false,
    id: null,
    close: false,
  })
  const files = ref([]);
  const toolbarFiltersCkEditor = computed(() => props.toolbarFiltersCkEditor);
  const loadingComment = ref(false);
  const canAddComment = computed(() => props.canAddComment);
  const commentableType = computed<string>(() => props.commentableType);
  const commentModel = ref<CommentModelContract>({ ...commentModelConst });
  const route = computed<string>(() => props.apiRoute);
  const mainImage = computed(() => {
    return item => item.userProfile && item.userProfile?.mainImage
      ? item?.userProfile?.mainImage : commentModelConst.avatar;
  })
  const comments = ref<commentsContract[]>([]);
  const loading = ref<boolean>(false);
  const permisionComments = computed(() => ({
    create: hasAccess(`${props.permisionComments}.create`),
    edit: hasAccess(`${props.permisionComments}.edit`),
    index: hasAccess(`${props.permisionComments}.index`),
    destroy: hasAccess(`${props.permisionComments}.destroy`),
  }));
  const dataBase = ref<any>({ ...commentModel.value });
  const textPlaceholder = computed<string>(() => i18n.tr('isite.cms.messages.writeComment'));
  const editorConfig = ref<EditorConfigContract>({
    height: 100,
  });

  /**
   * Formats the given date string to a human-readable format.
   * @param {string} date - The date string to be formatted.
   * @returns {Date|null} Formatted date or null if input is invalid.
   */
  function formatDate(date: string): Date {
    return date ? moment(date).format("DD MMM YYYY, h:mm a") as any : null;
  };
  /**
    * Activates the comment text input field.
  */
  function activeText(): void {
    loadingComment.value = true;
    dataBase.value.active = true;
    dataBase.value.text = "";
    setTimeout(() => {
      loadingComment.value = false;
    }, 1000);
    dataComment.value.close = true;
  }
  /**
   * Cancels the comment text input or ongoing edit operation.
 */
  function cancelText(): void {
    if (dataBase.value.text.length > 0) {
      $q
        .dialog({
          ok: "Si",
          message: i18n.tr(`isite.cms.messages.undoComment`),
          cancel: "No",
          persistent: true,
        })
        .onOk(async () => {
          dataBase.value.active = false;
          dataBase.value.text = "";
          dataComment.value.close = false;
          files.value = []
        })
        .onCancel(() => { });
    } else {
      dataBase.value.active = false;
      dataComment.value.close = false;
      files.value = []
    }
  }
  /**
  * Updates an existing comment based on the type and comment ID.
  * @param {string} type - Type of update operation ('cancel' or 'edit').
  * @param {number} id - ID of the comment to be updated.
  */
  function updateComment(type: string, id: number): void {
    try {
      const comment = comments.value.find((item) => item.id === id);
      if (comment) {
        if (type == "cancel") {
          cancelComment(comment);
        }
        if (type == "edit") {
          if (comment.comment !== comment.textEdit) {
            editComment(id, comment);
          } else {
            cancelComment(comment);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * Cancels the ongoing comment edit operation.
   * @param {commentsContract} comment - The comment object to be canceled.
   */
  function cancelComment(comment: commentsContract): void {
    if (comment.comment !== comment.textEdit) {
      $q
        .dialog({
          ok: i18n.tr('isite.cms.label.yes'),
          message: i18n.tr(`isite.cms.messages.undoComment`),
          cancel: i18n.tr('isite.cms.label.no'),
          persistent: true,
        })
        .onOk(async () => {
          comment.comment = comment.textEdit;
          comment.active = false;
          comment.files = [];
          dataComment.value.close = false;
          comment.files = [];
        })
        .onCancel(() => { });
    } else {
      comment.active = false;
      dataComment.value.close = false;
      comment.files = [];
    }
  }
  /**
   * Edits the specified comment.
   * @param {number} id - ID of the comment to be edited.
   * @param {commentsContract} comment - The comment object to be edited.
   */
  function editComment(id: number, comment: commentsContract) {
    try {
      comment.loading = true;
      const params = {
        approved: comment.approved,
        commentableType: props.commentableType,
        commentableId: props.commentableId,
        comment: comment.comment,
        userId: comment.userId,
        is_internal: comment.is_internal,
        options: comment.options,
      };
      crud
        .update(route.value, id, { ...params })
        .then((response) => {
          const commentUpdate = response.data;
          comment.updatedAt = commentUpdate.updatedAt;
          comment.loading = false;
          comment.active = false;
          comment.edit = false;
          comment.files = [];
          alert.info({
            message: i18n.tr(`isite.cms.messages.updateComment`),
          });

        })
        .catch((error) => {
          comment.loading = false;
          console.log(error);
          alert.error({
            message: i18n.tr(`isite.cms.messages.updateNoComment`),
          });
        });
      dataComment.value.close = false;
    } catch (error) {
      console.log(error);
      dataComment.value.close = false;
    }
  }
  /**
   * Activates the edit mode for the specified comment.
   * @param {number} id - ID of the comment to be edited.
   */
  function activeEdit(id: number): void {
    try {
      dataComment.value.id = id;
      const comment = comments.value.find((item) => item.id === id);
      if (comment) {
        comment.textEdit = comment.comment;
        comment.active = true;
        dataComment.value.edit = true;
        dataComment.value.close = true;
      }
    } catch (error) {
      console.log(error);
      dataComment.value.edit = false;
      dataComment.value.close = false;
    }
  }
  /**
   * Adds a new comment to the system.
   */
  async function addComment(): Promise<void> {
    try {
      if (dataBase.value.text.length === 0) return;
      const userId = store.state.quserAuth.userId;
      dataBase.value.loading = true;
      const params = {
        approved: true,
        commentableType: props.commentableType,
        commentableId: props.commentableId,
        comment: dataBase.value.text,
        userId: userId,
        is_internal: false,
        options: { "attachments": files.value.length > 0 ? files.value.map(item => item.id) : null },
      };
      await crud.create(route.value, params);
      await getCommentsList(props.commentableId);
      dataBase.value = { ...commentModel.value };
      files.value = [];
      alert.info({
        message: i18n.tr(`isite.cms.messages.savedComment`),
      });
    } catch (error) {
      console.log(error);
      dataBase.value.loading = false;
      alert.error({
        message: i18n.tr(`isite.cms.messages.savedNoComment`),
      });
    }
  }
  /**
   * Deletes the specified comment.
   * @param {number} id - ID of the comment to be deleted.
   */
  async function deleteComment(id: number): Promise<void> {
    $q
      .dialog({
        ok: i18n.tr("isite.cms.label.delete"),
        message: i18n.tr("isite.cms.messages.deleteRecord"),
        cancel: true,
        persistent: true,
      })
      .onOk(async () => {
        crud
          .delete(route.value, id)
          .then((response) => {
            comments.value = comments.value.filter(
              (item) => item.id !== id
            );
            alert.info({
              message: i18n.tr("isite.cms.message.recordDeleted"),
            });
          })
          .catch((error) => {
            console.log(error);
            alert.error({
              message: i18n.tr("isite.cms.message.recordNoDeleted"),
            });
          });
      })
      .onCancel(() => { });
  }
  /**
   * Retrieves the list of comments for the given commentable entity.
   * @param {number} commentableId - ID of the commentable entity.
   */
  async function getCommentsList(commentableId: number): Promise<void> {
    try {
      const config = await configComment();
      loading.value = true;
      const params = {
        filter: {
          commentableType: commentableType.value,
          commentableId,
          order: {
            field: 'created_at',
            way: 'desc',
          }
        },
        include: "userProfile",
      };
      crud
        .get(route.value, params)
        .then((response) => {
          const data = response.data;
          comments.value = data.map((item) => ({
            ...item,
            active: false,
            loading: false,
            textEdit: "",
            icon: item.type && config.data[item.type]?.icon ? config.data[item.type]?.icon : 'fa-regular fa-comment',
            color: item.type && config.data[item.type]?.color ? config.data[item.type]?.color : 'primary',
            files: item.files ?? [],
          }));
          loading.value = false;
        })
        .catch((error) => {
          loading.value = false;
          alert.error({ message: error });
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * Retrieves the comment configuration from the server.
   */
  async function configComment() {
    let routeParams = helper.getInfoFromPermission(router.route.meta.permission);
    if (!routeParams) return;
    let requestParams = {
      refresh: true,
      params: {
        filter: {
          configName: `${routeParams.module}.config.commentableConfig.requestable`
        }
      }
    }
    //Request
    return await crud.index('apiRoutes.qsite.configs', requestParams);
  }
  // Initialize the comments list when the component is created
  getCommentsList(props.commentableId);
  // Hook to handle component cleanup and finalize ongoing comment operations
  onBeforeUnmount(async () => {
    console.log(dataComment.value.close)
    if (dataComment.value.close) {
      if (dataComment.value.edit) {
        await updateComment('edit', dataComment.value.id)
      } else {
        await addComment();
      }
    }
  })
  return {
    permisionComments,
    dataBase,
    activeText,
    cancelText,
    updateComment,
    cancelComment,
    editComment,
    activeEdit,
    addComment,
    deleteComment,
    getCommentsList,
    textPlaceholder,
    editorConfig,
    formatDate,
    comments,
    loading,
    mainImage,
    loadingComment,
    files,
    i18n,
    canAddComment,
    toolbarFiltersCkEditor
  };
}
