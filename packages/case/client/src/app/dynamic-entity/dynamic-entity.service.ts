import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, firstValueFrom, map, shareReplay } from 'rxjs'

import { Params } from '@angular/router'
import { Paginator } from '@casejs/types'
import { SelectOption } from '~shared/interfaces/select-option.interface'
import { EntityMeta } from '../../../../shared/interfaces/entity-meta.interface'
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DynamicEntityService {
  serviceUrl = environment.apiBaseUrl + '/dynamic'
  private entityMetas$: Observable<EntityMeta[]>

  constructor(private http: HttpClient) {}

  loadEntityMeta(): Observable<EntityMeta[]> {
    if (!this.entityMetas$) {
      this.entityMetas$ = this.http.get<any>(`${this.serviceUrl}/meta`).pipe(
        shareReplay(1),
        map((res: EntityMeta[]) => res)
      )
    }
    return this.entityMetas$
  }

  list(entitySlug: string, params?: Params): Promise<Paginator<any>> {
    const queryParams: {
      [key: string]: any
    } = {
      page: params?.['page'] || 1,
      perPage: 20
    }

    // Add filters with _eq suffix.
    Object.keys(params || {}).forEach((key: string) => {
      if (key !== 'page') {
        queryParams[`${key}_eq`] = params[key]
      }
    })

    return firstValueFrom(
      this.http.get(`${this.serviceUrl}/${entitySlug}`, {
        params: queryParams
      })
    ) as Promise<Paginator<any>>
  }

  async download(entitySlug: string, params?: Params): Promise<void> {
    const queryParams: { [key: string]: any } = Object.assign({}, params) || {}

    queryParams['export'] = true

    const res: { filePath: string } = (await firstValueFrom(
      this.http.get(`${this.serviceUrl}/${entitySlug}`, {
        params: queryParams
      })
    )) as { filePath: string }

    const filePath: string = environment.storagePath + res.filePath

    const link = document.createElement('a')
    link.href = filePath
    link.download = filePath.split('/').pop()
    link.dispatchEvent(new MouseEvent('click'))
  }

  listSelectOptions(entitySlug: string): Promise<SelectOption[]> {
    return firstValueFrom(
      this.http.get(`${this.serviceUrl}/${entitySlug}/select-options`)
    ) as Promise<SelectOption[]>
  }

  show(entitySlug: string, id: number): Promise<any> {
    return firstValueFrom(
      this.http.get(`${this.serviceUrl}/${entitySlug}/${id}`)
    )
  }

  create(entitySlug: string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.serviceUrl}/${entitySlug}`, data)
    )
  }

  update(entitySlug: string, id: number, data: any): Promise<any> {
    return firstValueFrom(
      this.http.put(`${this.serviceUrl}/${entitySlug}/${id}`, data)
    )
  }

  delete(entitySlug: string, id: number): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.serviceUrl}/${entitySlug}/${id}`)
    )
  }
}
