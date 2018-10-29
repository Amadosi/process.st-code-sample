class AbstractNotification {

    constructor(notifiable) {
        this.notifiable = notifiable;
        //get the list of notifiable channels
        this._channels = this.via(this.notifiable);
    }

    /**
     * function that initiates and calls notification
     * */
    notify(){
        this._channels.forEach((item, index)=>{

            if (item === "mail") {
                this.toMail(this.notifiable).send();
            } else if (item === "sms") {
                this.toSms(this.notifiable);
            }
        });
    }

    /**
     * Defines the wanted channels
     * of notification
     * */
    via(notifiable) {
        return ['']
    }

    /**
     * function to notify by mail
     * */
    toMail(notifiable){
        //send mail to notifiable object
    }

    /**
     * function to notify by sms
     * */
    toSms(notifiable){
        //send an sms to the notifiable
    }
}

module.exports = AbstractNotification;