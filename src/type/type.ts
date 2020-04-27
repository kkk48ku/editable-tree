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
