import { Pipe, PipeTransform } from '@angular/core';
import { PetCategory, PetType } from '../model/appointment.model';

@Pipe({
  name: 'petCategoryByPetType',
  pure: false
})
export class PetCategoryByPetTypePipe implements PipeTransform {

  transform(items: PetCategory[], filter: { petTypeId: string }): any {
    if (!items) {
        return items;
    }
    if(!filter || !filter.petTypeId)
      return [];
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(item => item.petType.petTypeId === filter.petTypeId);
}

}


