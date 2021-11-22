/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { SqlFormatter } from '../../modules/sql.strings';
import SqlStr = require('sqlstring');
import e = require('express');
import { schemaIfc } from '../../modules/DbModule';
import { entities_schema, entities_schema_table } from '../../schemas/entities.schema';
import { EntityDTO } from '../../dtos/entities.DTO';
import { uuidIfc } from '../../interfaces/uuidIfc';
import SysLog from '../../modules/SysLog';
import SysEnv from '../../modules/SysEnv';
import appDbConnection from '../../modules/AppDBModule';

export class EntityModel {
  tableName = entities_schema_table;
  schema: schemaIfc[] = entities_schema;
  requestDTO: any;
  responseDTO: any;
  siteCode = SysEnv.SITE_CODE;
  constructor (altTable?: string) {
    if (altTable) {
        this.tableName = altTable;
    }
    this.requestDTO = EntityDTO;
    this.responseDTO = EntityDTO;
    this.siteCode = SysEnv.SITE_CODE;
  }
/**
 * function to create entity
 * @param dataInEntity entity DTO for insert
 */
  create = (dataInEntity: any): Promise<any> => {
    return new Promise((resolve) => {
      const newEntity = new this.requestDTO(dataInEntity);
      newEntity.site_code = this.siteCode;
      SqlFormatter.formatInsert(
        newEntity,
        this.tableName,
        this.schema
      ).then((sql) => {
        appDbConnection.connectDB().then((DBSession) => {
          DBSession.startTransaction().then(() => {
            DBSession.sql('SET @uuidId=UUID(); ').execute()
            .then((result) => {
              DBSession.sql(sql).execute()
              .then((result2) => {
                DBSession.sql('SELECT @uuidId;').execute()
                .then((result3) => {
                  DBSession.commit().then((success) => {
                    if (success) {
                      SysLog.info('created Entity: ', result3);
                      const newUuid: uuidIfc = { '@uuidId': result3.rows[0][0] }; // TODO
                      newEntity.id = newUuid['@uuidId'];
                      resolve(newEntity);
                    } else {
                      SysLog.error("Failed Committing Data");
                      resolve(undefined);
                    }
                  }).catch(() => {
                    SysLog.error("Failed Committing Data");
                    resolve(undefined);
                  });
                })
                .catch((err) => {
                  SysLog.error(JSON.stringify(err));
                  resolve(undefined);
                  return;
                });
              })
              .catch((err) => {
                SysLog.error(JSON.stringify(err));
                resolve(undefined);
                return;
              });
            })
            .catch((err) => {
              SysLog.error(JSON.stringify(err));
              const respEntityDTO = new this.responseDTO(newEntity);
              resolve(respEntityDTO);
              return;
            });
          }).catch(() => {
            SysLog.error("Failed Starting SQL transaction");
            resolve(undefined);
          });
        });
      });
    });
  };

/**
 * Generic function to find data using the entity.id
 * @param entityId unique entity.id
 */
  findById = (entityId: string): Promise<any | undefined> => {
    return new Promise ((resolve) => {
      let sql =
      SqlFormatter.formatSelect(this.tableName, this.schema) + ' WHERE ';
      sql += SqlStr.format('id = UUID_TO_BIN(?)', [entityId]);
      SysLog.info('findById SQL: ' + sql);
      appDbConnection.connectDB().then((DBSession) => {
        DBSession.sql(sql).execute()
        .then((result) => {
          if (result.rows.length) {
            const data = SqlFormatter.transposeResultSet(this.schema,
              undefined,
              undefined,
              result.rows[0]);
            const respEntityDTO = new this.responseDTO(data);
            resolve(respEntityDTO);
            return;
          }
          // not found Customer with the id
          resolve(undefined);
        })
        .catch((err) => {
          SysLog.error(JSON.stringify(err));
          resolve(undefined);
          return;
        })
      });
    });
  };

/**
 * Generic function to update entity by entity.id
 * @param entityId  unique entity.id
 * @param entityDTO DTO with properties to be updated
 */
  updateById = async (entityId: string, entityDTO: any): Promise<any | undefined> => {
    return new Promise ((resolve) => {
      appDbConnection.connectDB().then((DBSession) => {
        DBSession.startTransaction().then(() => {
          SqlFormatter.formatUpdate(this.tableName, this.schema, entityDTO).then ((sql) => {
            sql += SqlFormatter.formatWhereAND('', {id: entityId}, this.tableName, this.schema);
            DBSession.sql(sql).execute()
            .then((result) => {
              DBSession.commit().then((success) => {
                if (success) {
                  SysLog.info('updated entity: ', { id: entityId, ...entityDTO });
                  this.findById(entityId).then((respEntityDTO) => {
                    resolve(respEntityDTO);
                  })
                } else {
                      SysLog.error("Failed Committing Data");
                      resolve(undefined);
                    }
              }).catch(() => {
                SysLog.error("Failed Committing Data");
                resolve(undefined);
              });
            })
            .catch((err) => {
              SysLog.error(JSON.stringify(err));
              resolve(undefined);
              return;
            });
          });
        }).catch(() => {
          SysLog.error("Failed Starting SQL transaction");
          resolve(undefined);
        });
      });

    });
  };

/**
 * Generic function to query database using properties in the conditions object
 * @param conditions - each property will be AND condition in the SQL
 * @param ignoreExclSelect - do not include properties that are excludeInSelect in the return DTO
 * @param excludeSelectProp - additional properties to be excluded
 */
  find = (
    conditions: any,
    showPassword?: boolean,
    ignoreExclSelect?: boolean,
    excludeSelectProp?: string[],

  ): Promise<any[]> => {
    const respEntityDTOArray: any[] = [];
    let sql = SqlFormatter.formatSelect(
      this.tableName,
      this.schema,
      ignoreExclSelect,
      excludeSelectProp
    );
    sql += SqlFormatter.formatWhereAND('', conditions,  this.tableName, this.schema) + ' AND ';
    sql = SqlFormatter.formatWhereAND(sql, {site_code: this.siteCode}, this.tableName, this.schema);
    SysLog.info('find SQL: ' + sql);
    return new Promise((resolve) => {
      appDbConnection.connectDB().then((DBSession) => {
        DBSession.sql(sql).execute()
        .then((result) => {
  
          if (result.rows.length) {
  
            result.rows.forEach((rowData: any) => {
              const data = SqlFormatter.transposeResultSet(this.schema,
                ignoreExclSelect,
                excludeSelectProp,
                rowData);
              const respEntityDTO = new this.responseDTO(data, showPassword);
              respEntityDTOArray.push(respEntityDTO);
            });
            resolve(respEntityDTOArray);
            return;
          }
          // not found with the id
          resolve(respEntityDTOArray);
        })
        .catch((err) => {
          SysLog.error(JSON.stringify(err));
          resolve(respEntityDTOArray);
          return;
        });
      });

    });
  };

/**
 * Generic function to get all entity records based on site_code
 */
  getAll = (): Promise<any[]> => {
    return new Promise ((resolve) => {
      const respEntityDTOArray:any[] = [];
      let sql = SqlFormatter.formatSelect(this.tableName, this.schema);
      sql += SqlFormatter.formatWhereAND('', {site_code: this.siteCode}, this.tableName, this.schema);
      appDbConnection.connectDB().then((DBSession) => {
        DBSession.sql(sql).execute()
        .then((result) => {
  
          if (result.rows.length) {
  
            result.rows.forEach((rowData: any) => {
              const data = SqlFormatter.transposeResultSet(this.schema,
                undefined,
                undefined,
                rowData);
              const respEntityDTO = new this.responseDTO(data);
              respEntityDTOArray.push(respEntityDTO);
            });
            resolve (respEntityDTOArray);
            return;
          }
          // not found
          resolve(respEntityDTOArray);
        })
        .catch((err) => {
          SysLog.error(JSON.stringify(err));
          resolve(respEntityDTOArray);
          return;
        });
      });

    });
  };

/**
 * Generic function to DELETE record from database using entity.id
 * @param id entity.id
 */
  remove = (id: string): Promise<any | undefined> => {
    return new Promise((resolve) => {
      let sql = 'DELETE FROM ' + this.tableName + ' WHERE ';
      sql += SqlStr.format('id = UUID_TO_BIN(?)', [id]);
      appDbConnection.connectDB().then((DBSession) => {
        DBSession.sql(sql).execute()
        .then((result) => {
          SysLog.info('deleted ' + this.tableName + ' with id: ', id);
          resolve({
            deleted_id: id
          });
        })
        .catch((err) => {
          SysLog.error(JSON.stringify(err));
          resolve(undefined);
          return;
        });
      });
    });
  };

/**
 * Generic function to update data status = DELETED using entity.id
 * @param id entity.id
 */
  deleteById = (
    id: string
  ): Promise<any[]> => {
    return new Promise((resolve) => {
      const resEntityDTOArray: any[] = [];
      let sql ='UPDATE ' + this.tableName;
      sql += ' SET status = ' + SqlStr.escape('DELETED')
      sql += ' WHERE ';
      sql += SqlStr.format('site_code = ?', [this.siteCode]) + ' AND ';
      sql += ' status != ' + SqlStr.escape('DELETED') + ' AND ';
      sql += SqlStr.format('id = UUID_TO_BIN(?)', [id]);
      SysLog.info('findByUserId SQL: ' + sql);
      appDbConnection.connectDB().then((DBSession) => {

        DBSession.startTransaction().then(() => {
          DBSession.sql(sql)
          .execute()
          .then((result) => {
            DBSession.commit().then((success) => {
              if (success) {
                if (result.rows.length) {
                  result.rows.forEach((rowData) => {
                    const data = SqlFormatter.transposeResultSet(
                      this.schema,
                      undefined,
                      undefined,
                      rowData
                    );
                    const respEntityDTO = new this.responseDTO(data);
                    resEntityDTOArray.push(respEntityDTO);
                  });
                  resolve(resEntityDTOArray);
                  return;
                }
                // not found Customer with the id
                resolve(resEntityDTOArray);
              } else {
                DBSession.rollback().finally(() => {
                  SysLog.error("Failed Commit Update");
                  resolve(resEntityDTOArray);
                  return;
                });
              }
            }).catch(() => {
              SysLog.error("Failed Commit Update");
              resolve(resEntityDTOArray);
              return;
            })
          })
          .catch((err) => {
            SysLog.error(JSON.stringify(err));
            resolve(resEntityDTOArray);
            return;
          });
        }).catch(() => {
          SysLog.error("Failed Starting SQL transaction");
          resolve(resEntityDTOArray);
        });
      });

    });
  };

}
