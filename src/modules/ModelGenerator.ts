/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { schemaIfc } from "./DbModule";
import SqlStr = require('sqlstring');
import CommonFn from "./CommonFnModule";


class ModelGenerator {
    /**
  * This function adds a new property to obj object
  * @param obj - target obj
  * @param fieldName - new property name
  * @param dflt - default value of property
  */
    public defineProperty(obj: any, fieldName: string, dflt: any) {
        return Object.defineProperty(obj, fieldName, {
            value: dflt,
            writable: true,
            configurable: true,
            enumerable: true,
        });
    }

    private excludeFromDTO (prop: schemaIfc, excludeProps: string[] | undefined) {
        let excl = false;
        if (excludeProps !== undefined && excludeProps.length > 0) {
            excludeProps.some((exclProp) => {
                if (exclProp === prop.fieldName) {
                    excl = true;
                    return true;
                }
            })
        }
        return excl;
    }


    /**
     * Append Schema properties to obj for INSERT DTO
     *
     * @param {*} obj
     * @param {schemaIfc[]} schema
     * @param {string[]} [excludeProps]
     * @return {*} 
     * @memberof ModelGenerator
     */
    public getInsertDTOFromSchema( obj: any, schema: schemaIfc[], excludeProps?: string[]) {
        schema.forEach((prop) => {
            if (prop.fieldName !== 'id' &&
                prop.fieldName !== 'site_code' &&
                prop.fieldName !== 'lastUpdateUsec' &&
                prop.fieldName !== "INDEX" && 
                !this.excludeFromDTO(prop, excludeProps)) {
                  if (!CommonFn.hasProperty(obj, prop.fieldName)) {
                    obj = this.defineProperty(obj, prop.fieldName, prop.default);
                  }
            }
        });
        return obj;
    }

    /**
     * Create new INSERT DTO from schema 
     * @param schema 
     * @param excludeProps 
     */
    public genCreateSchemaModel(schema: schemaIfc[], excludeProps?: string[]) {
        let obj = Object.create(null);
        schema.forEach((prop) => {
            if (prop.fieldName !== 'id' &&
                prop.fieldName !== 'site_code' &&
                prop.fieldName !== 'lastUpdateUsec' &&
                prop.fieldName !== "INDEX" && 
                !this.excludeFromDTO(prop, excludeProps)) {
                obj = this.defineProperty(obj, prop.fieldName, prop.default);
            }
        });
        return obj;
    }

/**
 * Append schema properties to obj - data DTO
 * @param obj 
 * @param schema 
 * @param excludeProps 
 */
    public genDTOFromSchema(obj: any, schema: schemaIfc[], excludeProps?: string[]) {
        schema.forEach((prop) => {
            if (prop.fieldName !== "INDEX" && !this.excludeFromDTO(prop, excludeProps)) {
                if (!CommonFn.hasProperty(obj, prop.fieldName)) {
                    obj = this.defineProperty(obj, prop.fieldName, prop.default);
                }
            }
        });
        return obj;
    }

/**
 * creates a new data DTO from schema
 * @param schema 
 * @param excludeProps 
 */
    public genSchemaModel(schema: schemaIfc[], excludeProps?: string[]) {
        let obj = Object.create(null);
        schema.forEach((prop) => {
            if (prop.fieldName !== "INDEX" && !this.excludeFromDTO(prop, excludeProps)) {
                obj = this.defineProperty(obj, prop.fieldName, prop.default);
            }
        });
        return obj;
    }
/**
 * Append schema properties to obj - UPDATE DTO
 * @param obj 
 * @param schema 
 * @param excludeProps 
 */
    public genUpdDTOFromSchema( obj: any, schema: schemaIfc[], excludeProps?: string[]) {
        schema.forEach((prop) => {
            if (prop.fieldName !== "INDEX" && !this.excludeFromDTO(prop, excludeProps)) {
                if (prop.excludeFromUpdate === undefined ||
                    (prop.excludeFromUpdate !== undefined && prop.excludeFromUpdate === false)) {
                        if (!CommonFn.hasProperty(obj, prop.fieldName)) {
                            obj = this.defineProperty(obj, prop.fieldName, prop.default);
                        }
                }
            }
        });
        return obj;
    }

/**
 * Create new UPDATE DTO from schema
 * @param schema 
 * @param excludeProps 
 */
    public genUpdateSchemaModel(schema: schemaIfc[], excludeProps?: string[]) {
        let obj = Object.create(null);
        schema.forEach((prop) => {
            if (prop.fieldName !== "INDEX" && !this.excludeFromDTO(prop, excludeProps)) {
                if (prop.excludeFromUpdate === undefined ||
                    (prop.excludeFromUpdate !== undefined && prop.excludeFromUpdate === false)) {
                    obj = this.defineProperty(obj, prop.fieldName, prop.default);
                }
            }
        });
        return obj;
    }

    public getSchema (schema: schemaIfc[], fieldName: string): schemaIfc | undefined {
        let colProp: schemaIfc | undefined;
        schema.some((col) => {
            if (col.fieldName === fieldName) {
                colProp = col;
                return true;
            }
        })
        return colProp;
    }

    public validateDTOSchema({ schema, requestDTO }: { schema: schemaIfc[]; requestDTO: any; }): string | undefined {
        let error: string | undefined = '';
        let errorMsg: string | undefined = undefined;
        for (const prop in requestDTO) {
            const colProp = this.getSchema(schema, prop);
            if (colProp === undefined) {
                error += prop + ' not in schema! ';
            } else {
                error = this.validateProperty(colProp, error, requestDTO);
            }
        }
        if (error !== undefined && error.length > 0) {
            errorMsg = "Invalid requestDTO : " + error;
        }

        return errorMsg;
    }

    public validateUpdateDTOSchema({ schema, requestDTO }: { schema: schemaIfc[]; requestDTO: any; }): string | undefined {
        let error: string | undefined = '';
        let errorMsg: string | undefined = undefined;
        for (const prop in requestDTO) {
            const colProp = this.getSchema(schema, prop);
            if (colProp === undefined) {
                error += prop + ' not in schema! ';
            } else {
                if (colProp.excludeFromUpdate != undefined && colProp.excludeFromUpdate) {
                    error += prop + ' cannot be updated! ';
                } else {
                    error = this.validateProperty(colProp, error, requestDTO);
                }
            }
        }
        if (error !== undefined && error.length > 0) {
            errorMsg = "Invalid requestDTO : " + error;
        }

        return errorMsg;
    }
    public validateCreateDTOSchema({ schema, postDTO }: { schema: schemaIfc[]; postDTO: any; }): string | undefined {
        let error: string | undefined = '' ;
        let errorMsg: string | undefined = undefined;

        schema.forEach((colProp) => {
            if (postDTO[colProp.fieldName]) {
                error = this.validateProperty(colProp, error, postDTO);
            } else {
                if (colProp.postRequired) {
                    error += colProp.fieldName + ' not defined! '
                }
            }
        });

        if (error !== undefined && error.length > 0) {
            errorMsg = "Invalid postDTO : " + error;
        }

        return errorMsg;
    }

    private validateProperty(colProp: schemaIfc, error: string | undefined, postDTO: any) {
        if (colProp.fieldName === 'INDEX') {
            error += colProp.fieldName + ' invalid property! ';
        }
        else {
            if (CommonFn.isString(postDTO[colProp.fieldName])) {
                if (colProp.trim) {
                    postDTO[colProp.fieldName].trim();
                }
                if (!colProp.allowNull) {
                    if (CommonFn.isUndefined(colProp.default)) {
                        if (postDTO[colProp.fieldName] === null) {
                            error += colProp.fieldName + ' must not be null, ';
                        }
                    } else {
                        if (postDTO[colProp.fieldName] === null) {
                            postDTO[colProp.fieldName] = colProp.default;
                        }
                    }
                }
                if (colProp.sqlType?.includes('ENUM', 0)) {
                    let foundEnum = false;
                    if (colProp.enum) {
                        colProp.enum.some((val) => {
                            if (val === postDTO[colProp.fieldName]) {
                                foundEnum = true;
                                return true;
                            }
                        });
                    }
                    if (!foundEnum) {
                        error += colProp.fieldName + ' undefined enum value, ';
                    }
                }
                else {
                    if (colProp.sqlType?.includes('VARCHAR')) {
                        let escStr = SqlStr.escape(postDTO[colProp.fieldName]);
                        escStr = escStr.replace("'","");
                        escStr = escStr.replace("'","");
                        if (colProp.size != undefined && colProp.size > 0) {
                            if (escStr.length > colProp.size) {
                                error += colProp.fieldName + ' exceed string length of ' + colProp.size + ', ';
                            }
                        }
                    }
                }
            }
            else {
                if (colProp.sqlType?.includes('VARCHAR') || colProp.sqlType?.includes('TEXT') || colProp.sqlType?.includes('BLOB') || colProp.sqlType?.includes('ENUM')) {
                    error += colProp.fieldName + ' invalid property value, ';
                }
            }
        }
        return error;
    }
}

const DTOGenerator = new ModelGenerator();

export default DTOGenerator;