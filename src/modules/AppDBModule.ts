import Session from 'mysqlx/lib/Session';
import dbConnection from './DbModule';



export class AppDbModule {
    dbConnection = dbConnection;

    public connectDB(): Promise<Session> {
        return new Promise((resolve) => {
            this.dbConnection.DBM_connectDB().then((connection) => {
                  resolve(connection);
            })
        });
    }
}



const appDbConnection = new AppDbModule ();

export default appDbConnection;
