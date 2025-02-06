import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTrimInput]',
})
export class TrimInputDirective {
  constructor(private el: ElementRef, private ngControl: NgControl) {}

  @HostListener('blur')
  onBlur() {
    const value = this.el.nativeElement.value.trim();
    if (this.ngControl.control) {
      this.ngControl.control.setValue(value, { emitEvent: false });
    }
  }
}
