<script setup>
import { ref } from 'vue'
import ChannelSelect from './ChannelSelect.vue'
import { Plus } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import {
  artPublishSerive,
  artGetDetailSerive,
  artEditSerive
} from '@/api/article'
import { baseURL } from '@/utils/request.js'
import axios from 'axios'
// 控制抽屉显示隐藏
const visibleDrawer = ref(false)

// 默认数据
const defaultForm = {
  title: '', //文章标题
  cate_id: '', //分类 id
  cover_img: '', // 封面图片 file 对象
  content: '', // string 内容
  state: '' //状态
}

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    {
      pattern: /^\S{1,10}$/,
      message: '标题必须是1-10位的非空字符',
      trigger: 'blur'
    }
  ],
  cate_id: [
    { required: true, message: '请选择分类', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]{1,15}$/,
      message: '分类别名必须是1-15位的字母数字',
      trigger: 'blur'
    }
  ]
}

// 准备数据
const formModel = ref({ ...defaultForm })

// 图片上传相关逻辑
const imageUrl = ref('')
const onSelectFile = (UploadFile) => {
  imageUrl.value = URL.createObjectURL(UploadFile.raw) //图片预览
  formModel.value.cover_img = UploadFile.raw
}

// 提交
const emit = defineEmits(['success'])
const onpublish = async (state) => {
  // 将已发布还是草稿状态，存入 formModel
  formModel.value.state = state

  // 注意：当前接口，需要的时 formData 对象
  // 将普通对象 => 转换成 => formData 对象
  const fd = new FormData()
  for (let key in formModel.value) {
    fd.append(key, formModel.value[key])
  }

  // 发请求
  if (formModel.value.id) {
    // 编辑操作
    await artEditSerive(fd)
    ElMessage.success('修改成功')
    visibleDrawer.value = false
    emit('success', 'edit')
  } else {
    // 添加操作
    await artPublishSerive(fd)
    ElMessage.success('添加成功')
    visibleDrawer.value = false
    // 通知父组件，添加成功
    emit('success', 'add')
  }
}

// 组件对外暴露一个方法 open， 基于open传来的参数 ， 区分添加还是编辑
// open({}) => 表单无需渲染，说明是添加
// opem({id, cate_name,...}) => 说明需要渲染，说明是编辑
// open调用后，可以打开弹窗
const editorRef = ref()
const open = async (row) => {
  visibleDrawer.value = true //显示抽屉

  if (row.id) {
    // 需要基于 row.id 发送请求， 获取编辑对应的详情数据，进行回显
    const res = await artGetDetailSerive(row.id)
    formModel.value = res.data.data
    // 图片需要单独处理回显
    imageUrl.value = baseURL + formModel.value.cover_img
    // 注意：提交给后台，需要的数据格式，时file对象格式
    // 需要将网络图片地址 => 转换成  file 对象，存储起来
    formModel.value.cover_img = await imageUrlToFile(
      imageUrl.value,
      formModel.value.cover_img
    )
  } else {
    formModel.value = { ...defaultForm } // 基于默认的数据，重置form数据
    // 这里重置了表单的数据，但是图片上传img地址，富文本编辑器内容 => 需要手动重置
    imageUrl.value = ''
    editorRef.value.setHTML('')
  }
}

// 将网络图片地址转换为File对象
async function imageUrlToFile(url, fileName) {
  try {
    // 第一步：使用axios获取网络图片数据
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const imageData = response.data

    // 第二步：将图片数据转换为Blob对象
    const blob = new Blob([imageData], {
      type: response.headers['content-type']
    })

    // 第三步：创建一个新的File对象
    const file = new File([blob], fileName, { type: blob.type })

    return file
  } catch (error) {
    console.error('将图片转换为File对象时发生错误:', error)
    throw error
  }
}

defineExpose({
  open
})
</script>
import ChannelSelect from './ChannelSelect.vue'

<template>
  <el-drawer
    v-model="visibleDrawer"
    :title="formModel.id ? '编辑文章' : '添加文章'"
    direction="rtl"
    size="50%"
  >
    <!-- 发表文章表单 -->
    <el-form
      :rules="rules"
      :model="formModel"
      ref="formRef"
      label-width="100px"
    >
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formModel.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="cate_id">
        <channel-select
          v-model="formModel.cate_id"
          width="100%"
        ></channel-select>
      </el-form-item>
      <el-form-item label="文章封面" prop="cover_img">
        <!-- 此处需要关闭 element-plus 的自动上传，不需要配置 action 等参数
            只需要做前端的本地预览图片即可， 无需再提交前上传图片
          语法：URL.createObjectURL(...) 创建本地预览的地址，来预览 -->
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="onSelectFile"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <div class="editor">
          <quill-editor
            ref="editorRef"
            v-model:content="formModel.content"
            theme="snow"
            contentType="html"
          ></quill-editor>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button @click="onpublish('已发布')" type="primary">发布</el-button>
        <el-button @click="onpublish('草稿')" type="info">草稿</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<style scoped lang="scss">
.avatar-uploader {
  :deep() {
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
    .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }
    .el-upload:hover {
      border-color: var(--el-color-primary);
    }
    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }
  }
}

.editor {
  width: 100%;
  :deep(.ql-editor) {
    min-height: 200px;
  }
}
</style>
