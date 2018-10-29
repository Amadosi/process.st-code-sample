const AbstractNotification = require('../services/notification/AbstractNotification');
const MailManager = require('../services/notification/MailManager');

class AccountVerificationNotifications extends AbstractNotification {

    /**
     * define your notification channels
     * available channels (mail,sms)
     * */
    via(notifiable) {
        return ['mail'];
    };

    /**
     * Define your to mail for sending
     * notification via mail channel
     * */
    toMail(notifiable) {
        const data = {
            user: notifiable,
            url: process.env.CLIENT_URL+"account-verification?token="+notifiable.getJWT()
        };

        return (new MailManager)
            .to(notifiable.email)
            .view(__basedir+ '/views/emails/welcome.html', data)
            .subject("Please Activate Your Account");
    }
}

module.exports = AccountVerificationNotifications;