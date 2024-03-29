import { Injectable } from '@nestjs/common'
import * as chalk from 'chalk'
import { DataSource, EntityMetadata, Repository } from 'typeorm'
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata'

import { PropType } from '../../../shared/enums/prop-type.enum'
import { EntityDefinition } from '../../../shared/interfaces/entity-definition.interface'
import { FileUploadService } from '../file-upload/file-upload.service'
import { ImageUploadService } from '../file-upload/image-upload.service'
import { EntityMetaService } from './services/entity-meta.service'

@Injectable()
export class CrudSeeder {
  constructor(
    private dataSource: DataSource,
    private entityMetaService: EntityMetaService,
    private fileUploadService: FileUploadService,
    private imageUploadService: ImageUploadService
  ) {}

  async seed(tableName?: string) {
    let entities: EntityMetadata[]

    if (tableName) {
      entities = entities.filter(
        (entity: EntityMetadata) => entity.tableName === tableName
      )
    } else {
      entities = this.sortEntitiesByHierarchy(this.dataSource.entityMetadatas)
    }

    const queryRunner = this.dataSource.createQueryRunner()

    await queryRunner.query('PRAGMA foreign_keys = OFF')

    await Promise.all(
      entities.map(async (entity: EntityMetadata) =>
        queryRunner
          .query(`DELETE FROM ${entity.tableName}`)
          .then(() =>
            queryRunner.query(
              `DELETE FROM sqlite_sequence WHERE name = '${entity.tableName}'`
            )
          )
      )
    )

    await queryRunner.query('PRAGMA foreign_keys = ON')

    console.log(chalk.blue('[x] Removed all existing data...'))

    let addDummyFile: boolean = false
    let addDummyImage: boolean = false

    for (const entity of entities) {
      const definition: EntityDefinition =
        this.entityMetaService.getEntityDefinition(entity)

      const entityRepository: Repository<any> =
        this.entityMetaService.getRepositoryFromTableName(entity.tableName)

      console.log(
        chalk.blue(
          `[x] Seeding ${definition.seedCount} ${
            definition.seedCount > 1
              ? definition.namePlural
              : definition.nameSingular
          }...`
        )
      )

      for (const index of Array(definition.seedCount).keys()) {
        const newItem = entityRepository.create()

        entity.columns.forEach((column: ColumnMetadata) => {
          if (column.propertyName === 'id' || column.propertyName === 'token') {
            return
          }

          const propSeederFn: (
            index?: number,
            relationSeedCount?: number
          ) => any = Reflect.getMetadata(`${column.propertyName}:seed`, newItem)

          const propType: PropType = Reflect.getMetadata(
            `${column.propertyName}:type`,
            newItem
          )

          if (propType === PropType.Relation) {
            const relatedEntity = Reflect.getMetadata(
              `${column.propertyName}:options`,
              newItem
            )?.entity

            const relatedEntityDefinition: EntityDefinition =
              this.entityMetaService.getEntityDefinition(relatedEntity.name)

            newItem[`${column.propertyName}`] = propSeederFn(
              index,
              relatedEntityDefinition.seedCount
            )
          } else {
            // Special case for the first admin user that has a custom email.
            if (
              index === 0 &&
              column.propertyName === 'email' &&
              entity.tableName === 'admin'
            ) {
              newItem[column.propertyName] = 'admin@case.app'
            } else {
              newItem[column.propertyName] = propSeederFn(index)
            }
          }

          if (propType === PropType.File) {
            addDummyFile = true
          }

          if (propType === PropType.Image) {
            addDummyImage = true
          }
        })

        // Save without listeners to avoid triggering the beforeInsert hook.
        await entityRepository.save(newItem, { listeners: false })
      }
    }

    if (addDummyFile) {
      this.fileUploadService.addDummyFile()
    }

    if (addDummyImage) {
      this.imageUploadService.addDummyImages()
    }
  }

  // Sort entities so that entities with relations are seeded after entities they depend on.
  private sortEntitiesByHierarchy(
    entities: EntityMetadata[]
  ): EntityMetadata[] {
    const orderedEntities: EntityMetadata[] = []

    entities.forEach((entity: EntityMetadata) => {
      const relationColumns: ColumnMetadata[] = entity.columns.filter(
        (column: ColumnMetadata) => column.relationMetadata
      )

      if (!relationColumns.length) {
        orderedEntities.push(entity)
      } else {
        relationColumns.forEach((relationColumn: ColumnMetadata) => {
          const relatedEntity: EntityMetadata =
            relationColumn.relationMetadata.entityMetadata

          if (orderedEntities.includes(relatedEntity)) {
            orderedEntities.splice(
              orderedEntities.indexOf(relatedEntity),
              0,
              entity
            )
          } else {
            orderedEntities.push(entity)
          }
        })
      }
    })

    return orderedEntities
  }
}
