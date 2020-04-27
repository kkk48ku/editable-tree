import React from 'react'
import ReactDOM from 'react-dom'
import EditableTree from './EditableTree'
import { IBaseNode } from './type/type'
import { message } from 'antd'

const list: IBaseNode[] = [
  {
    id: 1,
    name: 'hhh',
    parentId: 0
  },
  {
    id: 2,
    name: 'zzz',
    parentId: 1
  },
  {
    id: 3,
    name: '一级',
    parentId: 0
  },
  {
    id: 32152198,
    name: '一级',
    parentId: 0
  },
  {
    id: 3321421,
    name: '一级',
    parentId: 0
  },
  {
    id: 21421,
    name: '一级',
    parentId: 0
  },
  {
    id: 31521521,
    name: '一级',
    parentId: 0
  },
  {
    id: 4,
    name: '二级',
    parentId: 1
  },
  {
    id: 5,
    name: '二级',
    parentId: 1
  },
  {
    id: 6,
    name: '三级',
    parentId: 5
  },
  {
    id: 7,
    name: '四级',
    parentId: 6
  },
  {
    id: 8,
    name: '五级',
    parentId: 7
  }
]

ReactDOM.render(
  <EditableTree
    list={list}
    onEdit={(value, id) => {
      console.log('value, id: ', value, id)
      value
        ? message.success(`value:${value}, id:${id}`)
        : message.warn(`value为空`)
    }}
    onCreate={(value, parentId) => {
      console.log('value,parentId: ', value, parentId)
      value
        ? message.success(`value:${value}, parentId:${parentId}`)
        : message.warn(`value为空`)
    }}
    onDelete={(id) => {
      console.log('id: ', id)
      message.success(`成功删除节点${id}`)
    }}
  />,
  document.getElementById('root')
)
