
export enum ServerPropertyTypeEnum {
    INT,
    TEXT
}

interface PropertyIfc  {
    name: string;
    type: ServerPropertyTypeEnum;
    value?: string;
    numValue?: number;
}

export const ServerDefaultProperties: PropertyIfc[] = [
    {
        name: 'nextAccountNumber',
        type:  ServerPropertyTypeEnum.INT,
        numValue: 100000
    },
    {
        name: 'nextGroupNumber',
        type:  ServerPropertyTypeEnum.INT,
        numValue: 100000
    },
    ];


