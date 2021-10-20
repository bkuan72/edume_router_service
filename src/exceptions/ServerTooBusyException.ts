import HttpException from "./HttpException";

class ServerTooBusyException extends HttpException {
  constructor() {
    super(503, `Server Too Busy!`);
  }
}

export default ServerTooBusyException;