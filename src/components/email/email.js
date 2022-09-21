import React, { useRef } from "react";
import { listSurveys } from "../../graphql/queries";
import emailjs from "@emailjs/browser";

import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
}));

const Email = () => {
  const form = useRef();
  const classes = useStyles();
  const linkValue = `https://fabulous-maamoul-0d4bdd.netlify.app/surveyquestions/d1c8b475-aabd-4b89-bf83-a5206837f9a7`;

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_h08azuh",
        "template_rxnlsc6",
        form.current,
        "ohDWD49b1XqDukyZd"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  return (
    // <form ref={form} onSubmit={sendEmail}>
    //   <label>Email</label>
    //   <input type="email" name="user_email" />

    //   <textarea name="message" type="hidden" value={linkValue} />
    //   <input type="submit" value="Send" />
    // </form>
    <form className={classes.root} onSubmit={sendEmail} autoComplete="off">
      <div>
        <TextField
          required
          id="standard-required"
          label="email"
          defaultValue="Enter Email"
          variant="outlined"
        />
        <TextField
          disabled
          id="standard-disabled"
          label="Disabled"
          value={linkValue}
          variant="outlined"
        />
        <Button type="submit" color="primary" value="send" variant="contained">
          send
        </Button>
      </div>
    </form>
  );
};

export default Email;
