import { NgClass, NgIf } from '@angular/common'
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core'
import { PropertyDescription } from '~shared/interfaces/property-description.interface'

@Component({
  selector: 'app-boolean-input',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <div class="control mt-7 mb-4">
      <label
        class="checkbox"
        [ngClass]="{ 'is-danger': isError }"
        for=""
        (click)="toggleCheck()"
        [ngClass]="{ 'is-checked': checked }"
        #input
        >{{ prop.label }}
        <span class="checkmark"></span>
      </label>
      <p class="help" *ngIf="helpText">{{ helpText }}</p>
    </div>
  `,
  styleUrls: ['./boolean-input.component.scss']
})
export class BooleanInputComponent implements OnChanges {
  @Input() prop: PropertyDescription
  @Input() value: boolean
  @Input() helpText?: string
  @Input() isError: boolean

  @Output() valueChanged: EventEmitter<boolean> = new EventEmitter()

  checked: boolean

  ngOnChanges(changes: SimpleChanges) {
    this.checked = !!this.value
  }

  toggleCheck() {
    this.checked = !this.checked
    this.valueChanged.emit(this.checked)
  }
}
