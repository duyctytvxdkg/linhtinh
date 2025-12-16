import {
  Directive,
  ElementRef,
  HostListener,
  Optional,
  AfterViewInit
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[currencyInput]',
  standalone: true
})
export class CurrencyInputDirective implements AfterViewInit {

  private lastFormattedValue = '';

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() private control: NgControl
  ) {}

  ngAfterViewInit(): void {
    const value = this.control?.control?.value;
    if (value != null) {
      this.formatAndSet(value);
    }
  }

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;

    const cursorPos = input.selectionStart ?? 0;
    const rightChars = input.value.length - cursorPos;

    const numeric = input.value.replace(/\D/g, '');

    this.control?.control?.setValue(
      numeric ? Number(numeric) : null
    );

    this.formatAndSet(numeric, rightChars);
  }

  private formatAndSet(value: string | number, rightChars = 0): void {
    const input = this.el.nativeElement;

    const num = Number(value);
    const formatted = value
      ? new Intl.NumberFormat('en-US').format(num)
      : '';

    if (formatted === this.lastFormattedValue) return;

    this.lastFormattedValue = formatted;
    input.value = formatted;

    if (rightChars >= 0) {
      const cursorPos = formatted.length - rightChars;
      requestAnimationFrame(() => {
        input.setSelectionRange(cursorPos, cursorPos);
      });
    }
  }
}
