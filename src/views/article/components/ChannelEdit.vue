<script setup>
import { ref } from 'vue'
import { artEditChannelSerive, artAddChannelSerive } from '@/api/article.js'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const formModel = ref({
  cate_name: '',
  cate_alias: ''
})

const formRef = ref()

const rules = {
  cate_name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    {
      pattern: /^\S{1,10}$/,
      message: '分类名必须是1-10位的非空字符',
      trigger: 'blur'
    }
  ],
  cate_alias: [
    { required: true, message: '请输入分类别名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]{1,15}$/,
      message: '分类别名必须是1-15位的字母数字',
      trigger: 'blur'
    }
  ]
}

const emit = defineEmits(['success'])
const onSubmit = async () => {
  await formRef.value.validate()
  const isEdit = formModel.value.id
  if (isEdit) {
    await artEditChannelSerive(formModel.value)
    ElMessage.success('编辑成功')
  } else {
    await artAddChannelSerive(formModel.value)
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
  emit('success')
}
// 组件对外暴露一个方法 open， 基于open传来的参数 ， 区分添加还是编辑
// open({}) => 表单无需渲染，说明是添加
// opem({id, cate_name,...}) => 说明需要渲染，说明是编辑
// open调用后，可以打开弹窗

const open = (row) => {
  console.log(row)
  dialogVisible.value = true
  formModel.value = { ...row } // 添加 -> 重置了表单内容，编辑-> 存储了需要回显的数据
}
// 向外暴露方法
defineExpose({
  open
})
</script>
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="formModel.id ? '编辑分类' : '添加分类'"
    width="30%"
  >
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-width="100px"
      style="padding-right: 30px"
    >
      <el-form-item prop="cate_name" label="分类名称">
        <el-input
          v-model="formModel.cate_name"
          placeholder="请输入分类名称"
        ></el-input>
      </el-form-item>
      <el-form-item prop="cate_alias" label="分类别名">
        <el-input
          v-model="formModel.cate_alias"
          placeholder="请输入分类别名"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
