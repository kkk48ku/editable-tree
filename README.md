# 基于 antd-design 、 react-hooks 及 typescript 实现一个可编辑的 Tree

## 前言

最近在做公司后台项目时，接到一个实现可编辑的树效果的需求，从网上找了很多例子，但是效果都不是我想要的，所以就自己实现了一个，这里将自己实现的思路总结成文，给大家在遇到相同需求时提供一点思路。

先看效果👇：

![tree](./tree.gif)

接下来我们开始吧。

## 准备工作

1. 定义 `TreeNode` 数据 interface

```javascript
// src/type/type.ts

import { DataNode } from 'rc-tree/lib/interface'

export interface ILeafNode extends DataNode {
  id: number
  name: string
  parentId: number
  isEdit: boolean
  isCreate: boolean
  children: ILeafNode[]
}

```

2. 实现一个 list 转化为 treeList 的函数，直接上代码：

```javascript
// src/library/utils.ts

export const translateDataToTree = <T extends ILeafNode>(
  data: Array<T>
): Array<T> => {
  const parents = data.reduce((list: Array<T>, item) => {
    item.parentId === 0 && list.push(item)
    return list
  }, [])

  const children = data.reduce((list: Array<T>, item) => {
    item.parentId !== 0 && list.push(item)
    return list
  }, [])

  const translator = (parents: Array<T>, children: Array<T>) => {
    parents.forEach((parent) => {
      children.forEach((child, index) => {
        if (child.parentId === parent.id) {
          const temp = JSON.parse(JSON.stringify(children))
          temp.splice(index, 1)

          translator([child], temp)
          isNotEmptyArray(parent.children)
            ? parent.children.push(child)
            : (parent.children = [child])
        }
      })
    })
  }
  translator(parents, children)
  return parents
}

```

3. 与后端约定基本数据格式

```javascript
// TreeNode
{
  id:1,
  name: '一级',
  parentId: 0
}
```

## 项目难点及解决方案

- 控制子节点编辑输入框和节点新建输入框的显示隐藏
  解决方案：维护一个`lineList`和一个`treeList`，控制 lineList 每一项的 `isCreate` 和 `isEdit` 属性。使用 `useEffect` 监听 `lineList` 改变并将其转换为 `treeList`。

```javascript
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

<Tree
  treeData={renderTree(treeList)}
/>

```

- 获取新插入的 input 节点使其 focus
  解决方案：一开始这里我是使用 useRef + settimeout 延迟 200ms 后 focus 的方案，但是因为 settimeout 的不确定性，我决定采用其他方案。

这里才用了推荐官方的方案：

```javascript
const inputNode = useCallback(
  (input) => {
    isInputShow && input && input.focus()
  },
  [isInputShow]
)

<Input ref={inputNode} />
```

- 点击按钮或输入框防止误选节点

解决方案：

1. 输入框通过判断 onSelect 的第二个参数对象里面的`node`，通过自己定义的标志判断是不是 input，如果是`input`防止被选中

```javascript
const INPUT_ID = 'inputId'

const handleTreeNodeSelect = (
  selectedKeys: (string | number)[],
  info?: { nativeEvent: MouseEvent }
) => {
  const inputId: any = (info?.nativeEvent?.target as HTMLInputElement)?.id
  // 防止选中input所在的节点
  if (inputId !== INPUT_ID) {
    setSelectedKeys(selectedKeys)
  }
}

<Input id={INPUT_ID} />
```

  2. 操作按钮通过`event.stopPropagation()`阻止冒泡

## 代码实现

实现可编辑 tree 的关键是利用 antd 的 `treeData` props, 这个 props 接受一个固定格式的数组，其中数组中的每一项`title`可以为 `HTML` 节点。

关键代码：

```javascript
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
          id={INPUT_ID}
          ref={inputNode}
          placeholder="请输入小组名"
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
              id={INPUT_ID}
              ref={inputNode}
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
```
