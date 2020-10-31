const jwt = require('jsonwebtoken');
const User = require('../models/user');
const expressJwt = require('express-jwt');

require('dotenv').config();

exports.signUp = async(req, res) => {
    // check if user exists
    const userExists = await User.findOne({email: req.body.email});
    if(userExists) {
        return res.status(403).json({
            message: "Email has been taken"
        })
    }
    // create new user
    const user = await new User(req.body);
    try {
        const savedUser = user.save()
        //  delete some user details to be returned back tothe endpoint
        const strippedUserDetails = user.toObject();
        delete strippedUserDetails.password;
        delete strippedUserDetails.salt;
        delete strippedUserDetails.hashed_password;
        const token = jwt.sign({id: user._id,}, process.env.JWT_TOKEN, {expiresIn: '24h'});
        if(savedUser) {
            return res.json({
                message: "Account successfully created",
                data: strippedUserDetails,
                // user: {_id, name, email},
                token: token,
            })
        }
    } catch (error) {
        console.log(error);
    }
}

exports.login = (req, res) => {
    const {email, password} = req.body;
    User.findOne({email}, (err, result) => {
        if(!result || err ) {
            return res.status(401).json({
                error: "username/password not found"
            });
        }

        if(!result.authenticate(password)) {
            return res.status(401).json({
                error: "Username/Password not found"
            })
        }

        // generate a token with the user id
        const token = jwt.sign({id: result._id}, process.env.JWT_TOKEN, {expiresIn: '24h'})

        // persist the name 'token and set expiry date
        res.cookie('token', {expire: new Date() + 999999  });

        const {_id, name, email} = result
        return res.json({
            message: "successfully signed in",
            data: {_id, name, email},
            token: token,
        })
    })

}

exports.hasAuthorization = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_TOKEN, async(err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.userId = user;
            const authUser = await User.findOne({_id: user.id}, (err, user) => {
                // if user is not found
                if(err || !user) {
                    return res.status(401).json({
                        error: "Details not found"
                    })
                }
                
                // append the user details to the request
                req.authUser = user
            
            })
            next();
        });
    } else {
        res.sendStatus(401);
    }
}

// middleware checks if the user is logged in
exports.authMiddleware = expressJwt({
    secret: process.env.JWT_TOKEN, 
    algorithms: ['HS256'],
    requestProperty: "auth",
})