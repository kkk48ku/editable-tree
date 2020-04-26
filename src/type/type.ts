import { DataNode } from 'rc-tree/lib/interface'

export interface ILeafNode extends DataNode {
  id: number
  name: string
  parentId: number
  isEdit: boolean
  isCreate: boolean
  children: ILeafNode[]
}
