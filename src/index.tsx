import React, { useState, Key } from 'react'
import ReactDOM from 'react-dom'
import EditableTree from './EditableTree'
import { message, Input } from 'antd'

import './styles/index.css'

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
    const deleteLeaf = (parentId: Key) => {
      list.forEach((item: any, index: number) => {
        if (item.id === parentId || item.parentId === parentId) {
          list.splice(index, 1)
          deleteLeaf(item.id)
        }
      })
    }
    deleteLeaf(parentId)
    return list
  }

  return (
    <>
      <EditableTree
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
          console.log('id: ', id)
          message.success(`成功删除节点${id}`)
          handleDelete(id)
        }}
      />
      <Input.TextArea
        rows={30}
        className="data-input"
        value={JSON.stringify(dataList)}
        onChange={({ target }) => {
          try {
            setDataList(JSON.parse(target.value))
          } catch (error) {}
        }}
      />
    </>
  )
}

// const dataList =

ReactDOM.render(<App />, document.getElementById('root'))
