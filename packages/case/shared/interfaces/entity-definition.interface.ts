import { AuthenticableEntity } from './authenticable-entity.interface'

export interface EntityDefinition {
  nameSingular: string
  namePlural: string
  slug: string
  propIdentifier: string

  /** The number of entities to seed in the database. */
  seedCount: number

  apiPolicies?: {
    create?: (user: AuthenticableEntity) => boolean
    read?: (user: AuthenticableEntity) => boolean
    update?: (user: AuthenticableEntity) => boolean
    delete?: (user: AuthenticableEntity) => boolean
  }
}
