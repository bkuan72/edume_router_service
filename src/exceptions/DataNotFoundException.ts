import HttpException from "./HttpException";

class DataNotFoundException extends HttpException {
  constructor(id:string) {
    super(204, `Data not Found for Id=${id}`);
  }
}

export default DataNotFoundException;