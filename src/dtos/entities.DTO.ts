/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DTOGenerator from '../modules/ModelGenerator';
import CommonFn from '../modules/CommonFnModule';
import { EntityData, entities_schema } from '../schemas/entities.schema';


export class EntityDTO {
  data: EntityData;
  constructor(propertyData?: any) {
    DTOGenerator.genDTOFromSchema(this, entities_schema);
    if (!CommonFn.isUndefined(propertyData)) {
      for (const prop in this) {
        if (CommonFn.hasProperty(propertyData, prop)) {
          this[prop] = propertyData[prop];
        }
      }
    }
  }
}

export class UpdEntityDTO {
  data: EntityData;
  constructor(propertyData?: any) {
    DTOGenerator.genUpdDTOFromSchema(this, entities_schema);
    if (!CommonFn.isUndefined(propertyData)) {
      for (const prop in this) {
        if (CommonFn.hasProperty(propertyData, prop)) {
          this[prop] = propertyData[prop];
        }
      }
    }
  }
}