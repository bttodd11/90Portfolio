import {React, useState} from "react";
import "./contact.css";

let Contact = () => {

  let [firstNameField, setFirstNameField] = useState("");
  let [lastNameField, setLastNameField ] = useState("")
  let [emailAddressField, setEmailAddress ] = useState("");
  let [messageField, setMessageField ] = useState("");


  let validateEmail = (email) => {

    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(email.match(mailformat)){
    } else {
        alert("Please enter a valid email address")
    }

  }



  let sendEmail = () => {

    validateEmail(emailAddressField)

    if(firstNameField.length <= 0){
      alert("Please enter first name")
      return
    }
    if(lastNameField.length <= 0){
      alert("Please enter last name")
      return
    }
    if(emailAddressField.length <= 0){
      alert("Please enter email address")
      return
    }
    if(messageField.length <= 0){
      alert("Please enter message")
      return
    }


    window.Email.send({
      SecureToken: "fe7a8d59-9f6a-4f27-a6c1-ea9394aa8d34",
      To: 'bttodd@icloud.com',
      From: emailAddressField,
      Subject: "Email from " + firstNameField + " " + lastNameField,
      Body: messageField,
    }).then(
      alert("Your message has been sent")
      )
  };

  return (
    <div id="contactSection">
      <div class="container-fluid">
        <body class="p-3 m-0 border-0 row">
          <p className="contactTitle">Connect</p>
          <div class="col-md-4 col-sm-12">
            <input type="email" class="form-control firstName" onChange={(e) => setFirstNameField(e.target.value)} placeholder="First Name"></input>
            <input type="email" class="form-control lastName" onChange={(e) => setLastNameField(e.target.value)} placeholder="Last Name"></input>
            <input type="email" class="form-control emailAddress" onChange={(e) => setEmailAddress(e.target.value)} placeholder="Email Address"></input>
          </div>
          <div class="col-md-8 col-sm-12">
            <textarea class="form-control message" id="exampleFormControlTextarea1" onChange={(e) => setMessageField(e.target.value)} placeholder="Enter Message" rows="6"></textarea>
          </div>
          <button type="button" class="btn btn-warning small" onClick={() => sendEmail()}>Send Message</button>
        </body>
      </div>
    </div>
  )

}

export default Contact;
