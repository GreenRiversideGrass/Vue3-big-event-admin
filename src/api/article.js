import request from '@/utils/request.js'

// 分类：获取文章分类
export const artGetChannelsSerive = () => request.get('/my/cate/list')

// 分类：添加文章分类
export const artAddChannelSerive = (data) => request.post('/my/cate/add', data)

// 分类：编辑文章分类
export const artEditChannelSerive = (data) => request.put('/my/cate/info', data)

// 分类：删除文章分类
export const artDelChannelSerive = (id) =>
  request.delete('/my/cate/del', { params: { id } })

// 文章：获取文章列表
export const artGetListService = (params) =>
  request.get('/my/article/list', {
    params
  })

// 文章：添加文章
// 注意：data需要是一个formData格式对象
export const artPublishSerive = (data) => request.post('/my/article/add', data)

// 文章：获取文章详情
export const artGetDetailSerive = (id) =>
  request.get('/my/article/info', {
    params: { id }
  })

// 文章：编辑文章
export const artEditSerive = (data) => request.put('/my/article/info', data)

// 文章：删除文章
export const artDelSerive = (id) =>
  request.delete('/my/article/info', { params: { id } })
