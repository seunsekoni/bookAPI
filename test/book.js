process.env.NODE_ENV = 'test';

// get the book model;
const Book = require('../models/book');
const User = require('../models/user');
const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();
const sinon = require("sinon");
const bookController = require('../controllers/book')
const authController = require('../controllers/auth');
var httpMocks = require('node-mocks-http');

// use chaiHttp
chai.use(chaiHttp);

let token;


let user = {
    "email": "test@gmail.com",
    "name": "test",
    "password": "password"
}

let userId;

let book = {
        
    "name":"Macbeth",
    "author": "William Shakespare",
    "publishedDate": "2020-12-21",
    "averageRating": 5,
    createdBy: userId
    
}
    



before((done) => {
    // empty the users table
    User.deleteMany({}, (err) => {
        // done();
    })

    Book.deleteMany({}, (err) => {
        // if(err)
        // done();
    })

    // create new user
    chai.request(app)
        .post('/signup')
        .send(user)
        .end((err, res) => {
            // console.log(res)
            res.should.have.status(200)
            token = res.body.token;
            userId = res.body.data._id
            done();
        })
        
})



describe('Books', () => {
    
    it('If the credentials exists in the system it should return the token generated against it.', (done) => {
        // console.log(userId)
        chai.request(app)
        .post("/login")
        .set("Content-Type", "application/json")
        .send({email: "test@gmail.com", password: "password"})
        
        .end( async(err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
            done();
        });
    });
    
    /**
     * Test fetching all books
     */
    describe('/GET books', () => {
        // do not require authorization for this route to fetch books
        it('guests can fetch all books and should fetch all books', (done) => {
            chai.request(app)
               .get('/books')
               .end((err, result) => {
                   result.should.have.status(200);
                   
           done();
               })
       })

    });

    /**
     * creating a new book
     */
    describe(' book', () => {
        it('should create a new book', (done) => {
            chai.request(app)
                .post('/new/book')
                .set('Authorization', `Bearer ${token}`)
                .send(book)
                .set('authUser', {"_id": userId})
                .end( (err, res) => {
                    bookId = res._id
                    res.should.have.status(200);
                    done();
                })
        })

    })

    
})
