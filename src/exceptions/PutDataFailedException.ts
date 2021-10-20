import HttpException from "./HttpException";

class PutDataFailedException extends HttpException {
  constructor( ) {
    super(400, `Put Data Failed!`);
  }
}

export default PutDataFailedException;