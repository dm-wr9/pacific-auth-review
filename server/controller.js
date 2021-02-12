const bcrypt = require("bcryptjs");

module.exports = {
  register: (req, res) => {
    const { name, email, password } = req.body;
    const db = req.app.get("db");

    //# code below is to check for a pre-existing user
    let foundUser = null;
    db.check_email(email)
      .then((res) => {
        foundUser = res.data[0];
      })
      .catch((err) => console.log("database error on register", err));

    //# code below is to add new user if email doesn't already exist,
    //# or code to send back error if email does exist
    if (foundUser === null) {
      //# this is where we sign them up and put them in the database
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      db.register_user({ name, email, hash })
        .then(() => {
          //# here we need to put the user data on session, and send back a
          //# response that the user was registered correctly
          req.session.user = { name, email };
          res.status(200).send(req.session.user);
        })
        .catch((err) => res.status(500).send(err));
    } else {
      //# send back an error message bc user already exists
      res.status(500).send("User already exists");
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    const db = req.app.get("db");
    try {
      let foundUser = await db.check_email(email);
      //# below line just takes the user data out of the array so it's just
      //# an object
      foundUser = foundUser[0];
      if (foundUser) {
        //# this is where we compare the password
        const dbPassword = foundUser.password;
        //# authenticated is a boolean
        const authenticated = bcrypt.compareSync(password, dbPassword);
        if (authenticated) {
          //# log in our user
          delete foundUser.password;
          req.session.user = foundUser;
          res.status(200).send(foundUser);
        } else {
          //# if password is incorrect
          //# send back an error
          res.status(500).send("Email or password incorrect");
        }
      } else {
        //# if email is incorrect
        //# send back an error
        res.status(500).send("Email or password incorrect");
      }
    } catch (err) {
      //# if the sql query fails
      res.status(500).send(err);
    }

    // let foundUser = null;
    // db.check_email(email)
    //   .then((res) => {
    //     foundUser = res.data[0];
    //     if (foundUser) {
    //       const dbPassword = foundUser.password;
    //       const authenticated = bcrypt.compareSync(password, dbPassword);
    //       if (authenticated) {
    //         delete foundUser.password;
    //         req.session.user = foundUser;
    //         res.status(200).send(foundUser);
    //       } else {
    //         res.status(500).send("Email or password incorrect");
    //       }
    //     } else {
    //       res.status(500).send("Email or password incorrect");
    //     }
    //   })
    //   .catch((err) => res.status(500).send(err));
  },
  logout: (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  },
};
