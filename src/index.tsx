import React, { useState, Key } from 'react'
import ReactDOM from 'react-dom'
import EditableTree from './EditableTree'
import { message, Input } from 'antd'

import './styles/index.css'
import { ILeafNode } from './type/type'

const App = () => {
  const [dataList, setDataList] = useState([
    {
      id: 1,
      name: 'hhh',
      parentId: 0
    },
    {
      id: 2,
      name: 'zzz',
      parentId: 0
    },
    {
      id: 3,
      name: '一级',
      parentId: 0
    },
    {
      id: 4,
      name: '一级',
      parentId: 0
    },
    {
      id: 5,
      name: '一级',
      parentId: 0
    },
    {
      id: 6,
      name: '一级',
      parentId: 0
    },
    {
      id: 7,
      name: '一级',
      parentId: 0
    },
    {
      id: 8,
      name: '二级',
      parentId: 1
    },
    {
      id: 9,
      name: '二级',
      parentId: 1
    },
    {
      id: 10,
      name: '三级',
      parentId: 5
    },
    {
      id: 11,
      name: '四级',
      parentId: 6
    },
    {
      id: 12,
      name: '五级',
      parentId: 7
    },
    {
      id: 13,
      name: '五级',
      parentId: 7
    },
    {
      id: 14,
      name: '五级',
      parentId: 13
    },
    {
      id: 15,
      name: '五级',
      parentId: 1
    }
  ])

  const handleEdit = (value: string, id: Key) => {
    const list = dataList.map((item) => ({
      ...item,
      name: id === item.id ? value : item.name
    }))
    setDataList(list)
  }

  const handleCreate = (value: string, parentId: Key) => {
    const list = [
      ...dataList,
      {
        id: Math.floor(Math.random() * 6000000) + 1,
        name: value,
        parentId: Number(parentId)
      }
    ]
    setDataList(list)
  }

  const handleDelete = (id: Key) => {
    const list = deletedList(id)
    setDataList(list)
  }

  const deletedList = (parentId: Key) => {
    const list = JSON.parse(JSON.stringify(dataList))
    const arr = [parentId]
    for (let i = 0; i < list.length; i++) {
      const isLeafOrChild =
        arr.includes(list[i].id) || arr.includes(list[i].parentId)

      if (isLeafOrChild) {
        arr.push(list[i].id)
        list.splice(i, 1)
        i--
      }
    }
    return list
  }
  return (
    <div className="container-demo">
      <EditableTree
        blockNode
        list={dataList}
        onEdit={(value, id) => {
          console.log('value, id: ', value, id)
          value && handleEdit(value, id)
          value
            ? message.success(`value:${value}, id:${id}`)
            : message.warn(`value为空`)
        }}
        onCreate={(value, parentId) => {
          console.log('value,parentId: ', value, parentId)
          value
            ? message.success(`value:${value}, parentId:${parentId}`)
            : message.warn(`value为空`)
          value && handleCreate(value, parentId)
        }}
        onDelete={(id) => {
          message.success(`成功删除节点${id}`)
          handleDelete(id)
        }}
      />
      <Input.TextArea
        className="data-input"
        value={JSON.stringify(dataList)}
        rows={27}
      />
    </div>
  )
}

// const dataList =

ReactDOM.render(<App />, document.getElementById('root'))
