const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');

class MailManager{

    constructor(){
        //initialise smtp
        this.init();
    }

    /**
     * initialise smtp variables
     * */
    init(){
        this.smtp_host = process.env.SMTP_HOST || "";
        this.smtp_port = process.env.SMTP_PORT || "";
        this.smtp_username = process.env.SMTP_USERNAME || "";
        this.smtp_password = process.env.SMTP_PASSWORD || "";
        this.smtp_enc = process.env.SMTP_ENC || true;

        this.mail_from = process.env.MAIL_FROM || "";
        this.mail_address = process.env.MAIL_ADDRESS || "";
    }

    /**
     * Function to set the receiver of the mail
     * */
    to(to){
        console.log(to);
        this.mail_to = to;
        return this;
    }

    /**
     * function used to set the mail
     * subject
     * */
    subject(subject){
        console.log(subject);
        this._subject = subject;
        return this;
    };

    /**
     * function used to set the view to be
     * used for html mail delivery
     * */
    view(view_path,data={}){
        console.log(view_path);

        this._view = view_path;
        this._view_data = data;
        return this;
    }

    /**
     * function to set the mail from name
     * */
    from(from){
        this.mail_from = from;
        return this;
    }

    /**
     * function to set the sender mail address
     * */
    address(address){
        this.mail_address = address;
        return this;
    }

    /**
     * for sending the email
     * */
    send(){
         this.transporter = nodemailer.createTransport({
            host: this.smtp_host,
            port: this.smtp_port,
            secure: this.smtp_enc, // true for 465, false for other ports
            auth: {
                user: this.smtp_username,
                pass: this.smtp_password
            }
        });
         //call the generate mail
        this.generateMail();
    }

    /**
     * function to generate and send the mail
     * */
    generateMail(){
        //if a view is provided
        if(this._view !== null && typeof this._view !== "undefined"){
            this.readViewContent(this._view,(err, html) =>{

                if(typeof html === "undefined"){
                    throw new Error("Expected a valid view path. Confirm your view path")
                }

                handlebars.registerHelper('link', function(url) {
                    return new handlebars.SafeString(url);
                });

                const template = handlebars.compile(html);
                // create template with data
                const htmlToSend = template(this._view_data);

                const mailOptions = {
                    from: this.mail_from +'<'+this.mail_address+'>',
                    to : this.mail_to,
                    subject : this._subject,
                    html : htmlToSend
                };

                this.transporter.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        //handle the error (Log etc)
                        console.log(error);
                    }
                });

            });
        }
    }

    /**
     * function to read the contents of a file
     * */
    readViewContent(path, callback){
        fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
            if (err) {
                callback(err)
            } else {
                callback(null, html);
            }
        });
    }
}

module.exports = MailManager;