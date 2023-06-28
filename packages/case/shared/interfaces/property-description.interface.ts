import { PropType } from '../enums/prop-type.enum'
import { RelationOptions } from './type-settings/relation-options.interface'

export interface PropertyDescription {
  propName: string
  label: string
  type: PropType
  options?: RelationOptions
}