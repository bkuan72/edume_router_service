/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DTOGenerator from '../modules/ModelGenerator';
import CommonFn from '../modules/CommonFnModule';
import { PropertyData, properties_schema } from '../schemas/properties.schema';


export class PropertyDTO {
  data: PropertyData;
  constructor(propertyData?: any) {
    DTOGenerator.genDTOFromSchema(this, properties_schema);
    if (!CommonFn.isUndefined(propertyData)) {
      for (const prop in this) {
        if (CommonFn.hasProperty(propertyData, prop)) {
          this[prop] = propertyData[prop];
        }
      }
    }
  }
}

export class UpdPropertyDTO {
  data: PropertyData;
  constructor(propertyData?: any) {
    DTOGenerator.genUpdDTOFromSchema(this, properties_schema);
    if (!CommonFn.isUndefined(propertyData)) {
      for (const prop in this) {
        if (CommonFn.hasProperty(propertyData, prop)) {
          this[prop] = propertyData[prop];
        }
      }
    }
  }
}