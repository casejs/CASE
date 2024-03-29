import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { EnumPropertyOptions } from '~shared/interfaces/property-options/enum-property-options.interface'
import { TruncatePipe } from '../../pipes/truncate.pipe'

@Component({
  selector: 'app-progress-bar-yield',
  template: `
    <div
      class="is-flex is-align-items-center is-white-space-nowrap tooltip has-tooltip-left"
      [attr.data-tooltip]="value || 'Unknown'"
      class="is-color-{{ valueIndex }}"
    >
      <ng-container *ngFor="let enumOption of enumAsArray; let i = index">
        <span *ngIf="valueIndex >= i" class="bullet"> </span>
        <span class="bullet" *ngIf="valueIndex < i" class="bullet is-grey">
        </span>
      </ng-container>
    </div>
  `,
  styleUrls: ['./progress-bar-yield.component.scss'],
  standalone: true,
  imports: [CommonModule, TruncatePipe]
})
export class ProgressBarYieldComponent implements OnInit {
  @Input() value: string
  @Input() options: EnumPropertyOptions

  enumAsArray: string[] = []
  valueIndex: number

  ngOnInit(): void {
    this.enumAsArray = Object.values(this.options.enum)
    this.valueIndex = this.enumAsArray.indexOf(this.value)
  }
}
