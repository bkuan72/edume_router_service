import { schemaIfc } from '../modules/DbModule';
import DTOGenerator from '../modules/ModelGenerator';

export const properties_schema_table = 'properties';

export const properties_schema: schemaIfc[] = [
  {    fieldName: 'id',
    sqlType: 'BINARY(16) PRIMARY KEY',
    primaryKey: true,
    default: '',
    uuidProperty: true,
    excludeFromUpdate: true,
    description: 'unique record identifier'
  },
  {    fieldName: 'site_code',
    sqlType: 'VARCHAR(20)',
    size: 20,
    allowNull: false,
    default: '',
    excludeFromUpdate: true,
    trim: true,
    description: 'website identifier'
  },
  {    fieldName: 'name',
  sqlType: 'VARCHAR(255)',
  size: 255,
  allowNull: false,
  default: '',
  excludeFromUpdate: true,
  trim: true,
  description: 'property name'
  },
  {    fieldName: 'property_type',
    sqlType: 'ENUM',
    size: 10,
    enum: ['INT',
        'TEXT'
        ],
    default: 'TEXT',
    description: 'property value type'
  },
  {    fieldName: 'value',
  sqlType: 'TEXT',
  size: 255,
  allowNull: true,
  default: '',
  excludeFromUpdate: false,
  trim: true,
  description: 'string property data'
  },
  {    fieldName: 'numValue',
  sqlType: 'INT',
  allowNull: false,
  default: '0',
  excludeFromUpdate: false,
  trim: true,
  description: 'numeric property data'
  },
  {    fieldName: 'status',
    sqlType: 'ENUM',
    size: 10,
    enum: ['OK',
        'DELETED'
        ],
    default: 'OK',
    description: 'record status'
  },
  {    fieldName: 'lastUpdateUsec',
  sqlType: 'BIGINT',
  default: '0',
  excludeFromUpdate: true,
  description: 'last update timestamp'
  },
  {    fieldName: 'INDEX',
    sqlType: undefined,
    index: [
      {
        name: 'last_upd_usec_idx',
        columns: [ 'site_code', 'lastUpdateUsec'],
        unique: false
      }
    ]
  }
];

const PropertySchemaModel = DTOGenerator.genSchemaModel(properties_schema);
export type PropertyData = typeof PropertySchemaModel;