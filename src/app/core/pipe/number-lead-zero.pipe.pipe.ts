import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberLeadZeroPipe'
})
export class NumberLeadZeroPipePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
