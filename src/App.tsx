import React, { useEffect, useState, Key, useCallback } from 'react'
import { Tree, Input, message } from 'antd'

import response from './list'
import { ILeafNode } from './type/type'
import { translateDataToTree } from './library/utils'
import IconEdit from './assets/icon-edit.svg'
import IconDelete from './assets/icon-delete.svg'
import IconCreate from './assets/icon-create.svg'

import './styles/App.css'

const App = () => {
  const [isInputShow, toggleInputShow] = useState(false)
  const [lineList, setLineList] = useState<ILeafNode[]>([])
  const [treeList, setTreeList] = useState<ILeafNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([])
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [autoExpandParent, setAutoExpandParent] = useState(true)

  useEffect(() => {
    const lineList: ILeafNode[] = response.map((item) => ({
      ...item,
      key: item.id,
      title: item.name,
      isCreate: false,
      isEdit: false,
      children: []
    }))
    setLineList(lineList)
  }, [])

  useEffect(() => {
    const list = JSON.parse(JSON.stringify(lineList))
    const treeList = translateDataToTree(list)
    setTreeList(treeList)
  }, [lineList])

  const inputNode = useCallback(
    (input) => {
      isInputShow && input && input.focus()
    },
    [isInputShow]
  )

  const toggleLeafEdit = (key: Key, isEdit: boolean) => {
    const list = lineList.map((leaf) => ({
      ...leaf,
      isCreate: false,
      isEdit: leaf.key === key ? isEdit : false
    }))
    setLineList(list)
    toggleInputShow(isEdit)
  }

  const toggleLeafCreate = (key: Key, isCreate: boolean) => {
    const list = lineList.map((leaf) => ({
      ...leaf,
      isEdit: false,
      isCreate: leaf.key === key ? isCreate : false
    }))
    setLineList(list)
    toggleInputShow(isCreate)
    handleExpand([...expandedKeys, key])
  }

  const handleLeafDelete = (key: Key) => {
    message.success(`成功删除节点${key}`)
  }

  const handleEdit = (value: string, key: Key) => {
    value
      ? message.success(`value:${value}, id:${key}`)
      : message.warn(`value为空`)
    toggleLeafEdit(key, false)
  }

  const handleCreate = (value: string, parentId: Key) => {
    value
      ? message.success(`value:${value}, parentId:${parentId}`)
      : message.warn(`value为空`)
    toggleLeafCreate(parentId, false)
  }

  const handleTreeNodeSelect = (selectedKeys: (string | number)[]) => {
    setSelectedKeys(selectedKeys)
  }

  const handleExpand = (expandedKeys: Key[]) => {
    setExpandedKeys([...new Set(expandedKeys)])
    setAutoExpandParent(false)
  }

  const renderTree: any = (
    list: ILeafNode[],
    idx: number,
    parentId: Key,
    isCreate: boolean
  ) => {
    const tree = list.map((leaf) => ({
      key: leaf.key,
      title: !leaf.isEdit ? (
        <div className="tree-leaf">
          <span>{leaf.name}</span>
          <span className="action">
            <img
              className="icon"
              src={IconCreate}
              alt="＋"
              onClick={(e) => {
                e.stopPropagation()
                toggleLeafCreate(leaf.key, true)
              }}
            />
            <img
              className="icon"
              src={IconEdit}
              alt="^"
              onClick={(e) => {
                e.stopPropagation()
                toggleLeafEdit(leaf.key, true)
              }}
            />
            <img
              className="icon"
              src={IconDelete}
              alt="×"
              onClick={(e) => {
                e.stopPropagation()
                handleLeafDelete(leaf.key)
              }}
            />
          </span>
        </div>
      ) : (
        <Input
          ref={inputNode}
          placeholder="请输入小组名"
          onPressEnter={({ currentTarget }) => {
            handleEdit(currentTarget.value, leaf.key)
          }}
          onBlur={({ currentTarget }) => {
            handleEdit(currentTarget.value, leaf.key)
          }}
        />
      ),
      children: leaf.children
        ? renderTree(leaf.children, idx + 1, leaf.key, leaf.isCreate)
        : renderTree([], idx + 1, leaf.key, leaf.isCreate)
    }))

    return isCreate
      ? tree.concat({
          key: idx - 1000000,
          title: (
            <Input
              ref={inputNode}
              onBlur={({ currentTarget }) => {
                handleCreate(currentTarget.value, parentId)
              }}
              onPressEnter={({ currentTarget }: any) => {
                handleCreate(currentTarget.value, parentId)
              }}
            />
          ),
          children: null
        })
      : tree
  }

  return (
    <div className="App">
      <Tree
        blockNode
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        treeData={renderTree(treeList)}
        onExpand={handleExpand}
        onSelect={handleTreeNodeSelect}
        autoExpandParent={autoExpandParent}
      />
    </div>
  )
}

export default App
