<script setup>
import { ref } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'
import ChannelSelect from './components/ChannelSelect.vue'
import ArticleEdit from './components/ArticleEdit.vue'
import { artGetListService, artDelSerive } from '@/api/article.js'
import { formatTime } from '@/utils/format.js'

const articleList = ref([]) //文章列表
const total = ref(0) //总条数
const loading = ref(false)

// 定义请求参数对象
const params = ref({
  pagenum: 1, //当前页
  pagesize: 5, //当前生效的每页条数
  cate_id: '',
  state: ''
})

// 基于params参数，获取文章列表
const getArticleList = async () => {
  loading.value = true

  const res = await artGetListService(params.value)
  articleList.value = res.data.data
  total.value = res.data.total

  loading.value = false
}
getArticleList()

// 处理分页逻辑
const onSizeChange = (size) => {
  // console.log('当前每页条数',size)
  // 只要是每页条数变化了，那么原来正在访问的当前页意义不大了，数据大概率已经不再原来那页了
  params.value.pagenum = 1
  params.value.pagesize = size
  // 基于最新的当前页 和 每页条数，渲染数据
  getArticleList()
}
const onCurrentChange = (page) => {
  // 更新当前页面
  params.value.pagenum = page
  // 基于最新的当前页面，渲染数据
  getArticleList()
}

// 搜索逻辑 => 按照最新的条件，重新检索，从第一页开始展示
const onSearch = () => {
  params.value.pagenum = 1 //重置页面
  getArticleList()
}
// 重置逻辑 => 将筛选条件清空，重新检索，从第一页开始展示
const onReset = () => {
  params.value.pagenum = 1 //重置页面
  params.value.cate_id = ''
  params.value.state = ''
  getArticleList()
}

const articleEditRef = ref()
// 添加逻辑
const onAddArticle = () => {
  articleEditRef.value.open({})
}
// 编辑逻辑
const onEditArticle = (row) => {
  articleEditRef.value.open(row)
}

// 删除逻辑
const onDeleteArticle = async (row) => {
  await ElMessageBox.confirm('你确认删除该文章信息吗？', '温馨提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  })
  await artDelSerive(row.id)
  ElMessage.success('删除成功')
  getArticleList()
}

// 添加或者编辑 成功的回调
const onSuccess = (type) => {
  if (type === 'add') {
    // 如果时添加，需要跳转渲染最后一页，编辑直接渲染当前页面
    const lastPage = Math.ceil((total.value + 1) / params.value.pagesize)
    // 更新成最大页码数，再渲染
    params.value.pagenum = lastPage
    getArticleList()
  } else {
    // 如果是编辑，直接渲染当前页面即可
    getArticleList()
  }
}
</script>
<template>
  <page-container title="文章管理">
    <template #extra>
      <el-button @click="onAddArticle" type="primary"> 添加文章 </el-button>
    </template>

    <!-- 表单区域 -->
    <el-form inline>
      <el-form-item label="文章分类：">
        <!-- vue2 => v-model :value 和 @input 的简写 -->
        <!-- vue3 => v-model :modelValue 和 @update:modelValue  的简写-->
        <channel-select
          v-model="params.cate_id"
          style="width: 200px"
        ></channel-select>
      </el-form-item>
      <el-form-item label="发布状态：">
        <!-- 这里后台标记发布状态，就是通过中文标记的， 已发布/草稿 -->
        <el-select v-model="params.state" style="width: 200px">
          <el-option label="已发布" value="已发布"></el-option>
          <el-option label="草稿" value="草稿"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSearch" type="primary">搜索</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格区域 -->
    <el-table :data="articleList" v-loading="loading" style="width: 100%">
      <el-table-column label="文章标题" width="400">
        <template #default="{ row }">
          <el-link type="primary" :underline="false">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="cate_name"></el-table-column>
      <el-table-column label="发表时间" prop="pub_date">
        <template #default="{ row }">
          {{ formatTime(row.pub_date) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="state"></el-table-column>
      <el-table-column label="操作" width="400">
        <!-- 利用作用于插槽 row 可以获取当前行的数据 => v-for 遍历 item -->
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="onEditArticle(row)"
          ></el-button>
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="onDeleteArticle(row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      v-model:current-page="params.pagenum"
      v-model:page-size="params.pagesize"
      :page-sizes="[2, 3, 4, 5, 10]"
      layout="jumper, total, sizes, prev, pager, next"
      background
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      style="margin-top: 20px; justify-content: flex-end"
    />
    <!-- 抽屉出口 -->
    <article-edit ref="articleEditRef" @success="onSuccess"></article-edit>
  </page-container>
</template>
