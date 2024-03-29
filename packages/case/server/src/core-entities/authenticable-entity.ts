import { SHA3 } from 'crypto-js'

import { IsEmail, IsNotEmpty } from 'class-validator'
import { PropType } from '../../../shared/enums/prop-type.enum'
import {
  BeforeInsert,
  BeforeUpdate
} from '../crud/decorators/entity-events.decorators'
import { Prop } from '../crud/decorators/prop.decorator'
import { BaseEntity } from './base-entity'

/*
 * The AuthenticableEntity class is a BaseEntity with an unique email and a password (used for admins, users and everyone that needs to be authenticated).
 */
export class AuthenticableEntity extends BaseEntity {
  @Prop({
    type: PropType.Email,
    validators: [IsNotEmpty(), IsEmail()],
    seed: (index: number) => 'user' + (index + 1) + '@case.app',
    typeORMOptions: {
      unique: true
    }
  })
  email: string

  @Prop({
    type: PropType.Password,
    options: {
      isHiddenInAdminList: true,
      isHidden: true
    },
    typeORMOptions: { select: false }
  })
  password: string

  @BeforeInsert()
  beforeInsert() {
    this.password = SHA3(this.password).toString()
  }

  @BeforeUpdate()
  beforeUpdate() {
    if (this.password) {
      this.password = SHA3(this.password).toString()
    } else {
      delete this.password
    }
  }
}
