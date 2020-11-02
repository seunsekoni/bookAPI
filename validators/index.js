const { check, validationResult } = require('express-validator');

// set validation rules
const authRegistration = (req, res) => {
    return [
        check('name', 'Name must not be blank').notEmpty(),
        check('name', 'Name should not be lower than 4 and greater than 20').isLength({
            min: 4,
            max: 20
          }),

        // Email check
        check('email', 'Email is required').notEmpty().isEmail()
          .matches(/.+\@.+\..+/)
          .withMessage("Email must contain the @ symbol"),

        // Password validation
        check('password', 'Password is required').notEmpty(),
        check('password', 'Name should not be lower than 6').isLength({
        min: 6,
        max: 700
        })
        // .matches(/\d/) enforces at least a digit to be part of the password from the frontend
        .withMessage("Password must contain a number"),
    ]
}


// validate Post creation...
const loginValidation = () => {
  return [
    // Email validations
    check('email', "Email must not be blank").notEmpty(),
    check('email', 'Email is required').notEmpty().isEmail()
          .matches(/.+\@.+\..+/)
          .withMessage("Email must contain the @ symbol"),
  ]
}

// Book validation
const createBookValidation = () => {
  return [
    // author validation
    check('author', "Author name is required").notEmpty(),
    check('author', "Author name should not be less than 4 characters and more than 50 characters")
                    .isLength({
                            min: 4,
                            max: 50
                          })
                    .trim().withMessage("Author name is required"),
    
    // name validation
    check('name', "Book name is required").notEmpty(),
    check('name', "Book name should not be less than 4 characters and more than 100 characters")
                    .isLength({
                            min: 4,
                            max: 100
                          })
                    .trim().withMessage("Book name must not be blank"),

    // name validation
    check('publishedDate', "Book name is required").notEmpty()
                    .isDate()
                    .trim().withMessage("Published date must be a valid date"),
  ]
}

// validate
const validation = (req, res, next) => {
    const errors = validationResult(req);
    //  if no error from the incoming request, go to the next middleware
    if (errors.isEmpty()) return next();

    // if error
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(422).json({
        errors: extractedErrors,
      });
}

// export as modules
module.exports = {
    authRegistration,
    validation,
    loginValidation,
    createBookValidation,
}
