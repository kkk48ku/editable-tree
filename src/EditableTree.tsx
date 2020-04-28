import React, { useEffect, useState, Key, useCallback } from 'react'
import { Tree, Input } from 'antd'
import { TreeProps } from 'antd/lib/tree'
import { translateDataToTree, isNotEmptyArray } from './library/utils'

import { ILeafNode, IBaseNode } from './type/type'
import IconEdit from './assets/icon-edit.svg'
import IconDelete from './assets/icon-delete.svg'
import IconCreate from './assets/icon-create.svg'

import './styles/App.css'

interface IEditableTree {
  list: IBaseNode[]
  onEdit?: (value: string, id: Key) => void
  onCreate?: (value: string, parentId: Key) => void
  onDelete?: (id: Key) => void
}

type ITreeProps = NeverPick<TreeProps, 'treeData'>

type NeverPick<T, U> = {
  [P in Exclude<keyof T, U>]?: T[P]
}

const INPUT_ID = 'inputId'

const EditableTree = ({
  list,
  onEdit,
  onCreate,
  // @ts-ignore
  treeData,
  onDelete,
  expandedKeys = [],
  selectedKeys = [],
  autoExpandParent = true,
  ...props
}: IEditableTree & ITreeProps) => {
  const [isInputShow, toggleInputShow] = useState(true)
  const [isUpdated, toggleUpdated] = useState(false)
  const [lineList, setLineList] = useState<ILeafNode[]>([])
  const [treeList, setTreeList] = useState<ILeafNode[]>([])
  const [expandKeys, setExpandKeys] = useState<Key[]>(expandedKeys)
  const [selectKeys, setSelectKeys] = useState<Key[]>(selectedKeys)
  const [autoExpand, setAutoExpand] = useState(autoExpandParent)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    const lineList: ILeafNode[] = isNotEmptyArray(list)
      ? list.map((item) => ({
          ...item,
          key: item.id,
          title: item.name,
          isCreate: false,
          isEdit: false,
          children: []
        }))
      : []
    setLineList(lineList)
  }, [list])

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
    toggleUpdated(false)
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
    handleExpand([...expandKeys, key])
  }

  const handleLeafEdit = (value: string, key: Key) => {
    toggleLeafEdit(key, false)
    setInputValue('')
    isUpdated && onEdit && onEdit(value, key)
  }

  const handleLeafCreate = (value: string, parentId: Key) => {
    toggleLeafCreate(parentId, false)
    setInputValue('')
    onCreate && onCreate(value, parentId)
  }

  const handleLeafDelete = (key: Key) => {
    onDelete && onDelete(key)
  }

  const handleTreeNodeSelect = (
    selectedKeys: (string | number)[],
    info?: { nativeEvent: MouseEvent }
  ) => {
    const inputId: any = (info?.nativeEvent?.target as HTMLInputElement)?.id
    // 防止选中input所在的节点
    if (inputId !== INPUT_ID) {
      setSelectKeys(selectedKeys)
    }
  }

  const handleExpand = (expandedKeys: Key[]) => {
    setExpandKeys([...new Set(expandedKeys)])
    setAutoExpand(false)
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
              alt="增"
              onClick={(e) => {
                e.stopPropagation()
                toggleLeafCreate(leaf.key, true)
              }}
            />
            <img
              className="icon"
              src={IconEdit}
              alt="改"
              onClick={(e) => {
                e.stopPropagation()
                toggleLeafEdit(leaf.key, true)
                setInputValue(leaf.name)
              }}
            />
            <img
              className="icon"
              src={IconDelete}
              alt="删"
              onClick={(e) => {
                e.stopPropagation()
                handleLeafDelete(leaf.key)
              }}
            />
          </span>
        </div>
      ) : (
        <Input
          id={INPUT_ID}
          maxLength={8}
          ref={inputNode}
          value={inputValue}
          placeholder="输入限制为8个字符"
          suffix={<span>{inputValue.length}/8</span>}
          onChange={({ currentTarget }) => {
            const val = currentTarget.value
            setInputValue(val)
            toggleUpdated(val !== leaf.name)
          }}
          onPressEnter={({ currentTarget }) => {
            handleLeafEdit(currentTarget.value, leaf.key)
          }}
          onBlur={({ currentTarget }) => {
            handleLeafEdit(currentTarget.value, leaf.key)
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
              maxLength={8}
              id={INPUT_ID}
              ref={inputNode}
              value={inputValue}
              placeholder="输入限制为8个字符"
              suffix={<span>{inputValue.length}/8</span>}
              onChange={({ currentTarget }) => {
                setInputValue(currentTarget.value)
              }}
              onBlur={({ currentTarget }) => {
                handleLeafCreate(currentTarget.value, parentId)
              }}
              onPressEnter={({ currentTarget }: any) => {
                handleLeafCreate(currentTarget.value, parentId)
              }}
            />
          ),
          children: null
        })
      : tree
  }

  return (
    <div className="container-editable-tree">
      <Tree
        {...props}
        blockNode
        selectedKeys={selectKeys}
        expandedKeys={expandKeys}
        treeData={renderTree(treeList)}
        onExpand={handleExpand}
        onSelect={handleTreeNodeSelect}
        autoExpandParent={autoExpand}
      />
    </div>
  )
}

export default EditableTree
