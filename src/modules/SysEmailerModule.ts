import { UserData } from './../schemas/users.schema';
import { ResponseUserDTO } from '../dtos/user.DTO';
import nodemailer from 'nodemailer';
import SysEnv from './SysEnv';
import Mailgen from 'mailgen';
import SysLog from './SysLog';

class Emailer {

  mailRegisterConfirmation = (newUser: ResponseUserDTO | UserData) => {
    return new Promise((resolve, reject) => {

      const nodemailerOption = {
        service: SysEnv.EMAIL_SERVICE,
        secure: true,
        auth: {
          user: SysEnv.EMAIL,
          pass: SysEnv.EMAIL_PASSWORD
        }
      };
      const mailgenOption = {
        theme: SysEnv.MAILER_THEME,
        product: {
          name: SysEnv.MAILER_PRODUCT_NAME,
          link: SysEnv.MAILER_PRODUCT_REGISTRATION_LINK
        }
      };
      const transporter = nodemailer.createTransport(nodemailerOption);
      const mailGenerator = new Mailgen(mailgenOption);

      const email = {
        body: {
          name: newUser.user_name,
          intro: "Welcome to Edu Me! We're very excited to have you on board.",
          action: {
            instructions: 'To get started with Edu Me, please click here:',
            button: {
              color: '#22BC66', // Optional action button color
              text: 'Confirm my email',
              link:
                SysEnv.MAILER_PRODUCT_REGISTRATION_LINK +
                ';email=' +
                newUser.email +
                ';reg_confirm_key=' +
                newUser.reg_confirm_key
            }
          },
          outro:
            "Need help, or have questions? Just reply to this email, we'd love to help."
        }
      } as Mailgen.Content;

      const mailBody = mailGenerator.generate(email);

      const message = {
        from: SysEnv.EMAIL,
        to: newUser.email,
        subject: 'Welcome To EduMe',
        html: mailBody
      };

      transporter
        .sendMail(message)
        .then(() => {
          resolve(undefined);
        })
        .catch((error) => {
          SysLog.error(
            'Error emailing Registration Confirmation',
            JSON.stringify(error)
          );
          reject(error);
        });
    });
  };

  mailResetPasswordConfirmation = (newUser: ResponseUserDTO | UserData) => {
    return new Promise((resolve, reject) => {

      const nodemailerOption = {
        service: SysEnv.EMAIL_SERVICE,
        secure: true,
        auth: {
          user: SysEnv.EMAIL,
          pass: SysEnv.EMAIL_PASSWORD
        }
      };
      const mailgenOption = {
        theme: SysEnv.MAILER_THEME,
        product: {
          name: SysEnv.MAILER_PRODUCT_NAME,
          link: SysEnv.MAILER_PRODUCT_RESET_PWD_LINK
        }
      };
      const transporter = nodemailer.createTransport(nodemailerOption);
      const mailGenerator = new Mailgen(mailgenOption);

      const email = {
        body: {
          name: newUser.user_name,
          intro: "You have requested to reset your password.",
          action: {
            instructions: 'To reset password, please click here:',
            button: {
              color: '#22BC66', // Optional action button color
              text: 'Reset My Password',
              link:
                SysEnv.MAILER_PRODUCT_RESET_PWD_LINK +
                ';email=' +
                newUser.email +
                ';pwd_reset_key=' +
                newUser.pwd_reset_key
            }
          },
          outro:
            "Need help, or have questions? Just reply to this email, we'd love to help."
        }
      } as Mailgen.Content;

      const mailBody = mailGenerator.generate(email);

      const message = {
        from: SysEnv.EMAIL,
        to: newUser.email,
        subject: 'Reset Edume Password',
        html: mailBody
      };

      transporter
        .sendMail(message)
        .then(() => {
          resolve(undefined);
        })
        .catch((error) => {
          SysLog.error(
            'Error emailing Registration Confirmation',
            JSON.stringify(error)
          );
          reject(error);
        });
    });
  };
}

const SysMailer = new Emailer();

export default SysMailer;
