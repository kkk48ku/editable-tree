# 基于 antd-design 、 react-hooks 及 typescript 封装一个可编辑的 Tree

## 前言

最近在做公司后台项目时，接到一个实现可编辑的树效果的需求，从网上找了很多例子，但是效果都不是我想要的，所以就自己实现了一个，这里将自己实现的思路总结成文，给大家在遇到相同需求时提供一点思路。

先看效果👇：

线上体验地址：[传送门](http://test.zuoning327.com:3000)，欢迎体验

![tree](./tree.gif)

接下来我们开始吧。

## 准备工作

1. 与后端约定基本数据格式

```javascript
// TreeNode
{
  id:1,
  name: '一级',
  parentId: 0
}
```

2. 定义 `ILeafNode`和 `IBaseNode` 数据 interface

```javascript
// src/type/type.ts

import { DataNode } from 'rc-tree/lib/interface'

export interface IBaseNode {
  id: number
  name: string
  parentId: number
}

export interface ILeafNode extends DataNode, IBaseNode {
  isEdit: boolean
  isCreate: boolean
  children: ILeafNode[]
}

```

3. 实现一个 list 转化为 treeList 的函数，直接上代码：

```javascript
// src/library/utils.ts

export const translateDataToTree = <T extends ILeafNode>(
  data: Array<T>
): Array<T> => {
  const parents = data.filter((item: T) => !item.parentId)

  const children = data.filter((item: T) => item.parentId > 0)

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

## 难点及解决方案

1. 控制子节点编辑输入框和节点新建输入框的显示隐藏

- 解决方案：维护一个`lineList`和一个`treeList`，控制 lineList 每一项的 `isCreate` 和 `isEdit` 属性。使用 `useEffect` 监听 `lineList` 改变并将其转换为 `treeList`。
`treeList` 改变后，tree 节点重新渲染。
我们就根据每一个节点的`isCreate`和`isEdit`属性控制是否显示输入框。

  ```javascript
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

2. 获取新插入的 input 并使其 focus

- 解决方案：一开始这里我是使用 useRef 的方案，但是 ref 为一个对象时无法监听到 ref 的变化，所以我决定采用其他方案。

    这里采用了官方推荐的方案 [传送门](https://reactjs.bootcss.com/docs/hooks-faq.html#how-can-i-measure-a-dom-node)：

    ```javascript
    const [isInputShow,toggleInputShow] = useState(false)

    const inputNode = useCallback(
      (input) => {
        isInputShow && input && input.focus()
      },
      [isInputShow]
    )

    <Input ref={inputNode} />
    ```

3. 点击按钮或输入框防止误选节点

- 解决方案：

  - 输入框通过判断 onSelect 的第二个参数对象里面的`node`，通过自己定义的标志判断是不是 input，如果是`input`防止被选中

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

  - 操作按钮通过`event.stopPropagation()`阻止点击事件冒泡

4. 处理传入的 props 和自己封装用到的 props 的关系

- 因为我们的封装是基于 `ant-tree` 实现的，不可能不让开发者使用别的 api，我们可以通过传递 props 的方案，将自己需要的属性初始化为开发者传入的属性或者默认值。其他值直接传递给 `Tree` 组件。但是需要注意的是，要提示开发者不能再传递 `treeData` 属性了，而是传递 `list` 属性由组件内部处理。

```javascript
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
  const [expandKeys, setExpandKeys] = useState<Key[]>(expandedKeys)
  const [selectKeys, setSelectKeys] = useState<Key[]>(selectedKeys)
  const [autoExpand, setAutoExpand] = useState(autoExpandParent)

  return <Tree
  {...props}
  selectedKeys={selectKeys}
  expandedKeys={expandKeys}
  treeData={renderTree(treeList)}
  onExpand={handleExpand}
  onSelect={handleTreeNodeSelect}
  autoExpandParent={autoExpand}
/>
}

```

- 那如果开发者传了怎么办呢，有两种处理办法：
  - typescript 约束提示

  ```javascript
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

  const EditableTree = ({ ...props }: IEditableTree & ITreeProps) => {
    return null
  }
  ```

  这样开发者再传递`treeData`属性，我们的编辑器就会做出提示，treeData 不是可接受的属性。

  - 从 props 中解构出 treeData 然后不做处理

  ```javascript
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
    return null
  }
  ```

  这里推荐两种方法一起采取。

## 代码实现

实现可编辑 tree 的关键是利用 antd 的 `treeData` props, 这个 props 接受一个固定格式的数组，其中数组中的每一项`title`可以为 `HTML` 节点。

关键代码：

```javascript
const renderTree: any = (
    list: ILeafNode[],
    idx: number, // 可以判断层级
    parentId: Key,
    isCreate: boolean // 是否是新增节点
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
```

## 最后

代码放在 github，地址是 [editable-tree](https://github.com/BovineBoy/editable-tree)，欢迎参考，如果对你有所帮助，希望可以点个star，如果有疑问欢迎在[这里](https://github.com/BovineBoy/editable-tree/issues)提issue，或留言讨论。
