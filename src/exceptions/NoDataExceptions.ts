import HttpException from "./HttpException";

class NoDataException extends HttpException {
  constructor() {
    super(204, `No Result Found`);
  }
}

export default NoDataException;