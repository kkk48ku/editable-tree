import { ILeafNode } from '../type/type'

export const isNotEmptyArray = <T = any>(data: Array<T>) =>
  data && Array.isArray(data) && data.length > 0

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
