import HttpException from "./HttpException";

class PostDataFailedException extends HttpException {
  constructor( ) {
    super(400, `Post Data Failed!`);
  }
}

export default PostDataFailedException;