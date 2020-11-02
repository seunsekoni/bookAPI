const Book = require('../models/book');
const faker = require('faker');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Rating = require('../models/rating');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const { response } = require('express');

// fetch all books
exports.fetchBooks = async(req, res) => {
    const books = await Book.find()
        .then( async(getBooks) => {
            let avgRating = await Rating.aggregate([
                {
                    $group:
                        {
                           _id:"$bookId",
                            AverageValue: { 
                                $avg: "$rating",
                            }
                        }
                }
            ])
            // calculate each book's average
            const editedBooks = getBooks.map(book => {
                avgRating.map(avg => {
                    // check if the bookId is equal to the id of the calculated book's average
                    // and set the value
                    if(avg._id.equals(book._id)) {
                        book.averageRating = avg.AverageValue;
    
                    }

                })
               return book
            });

            res.json({
                success: true,
                message:"Successfully fetched all books.",
                books: editedBooks,
                average: avgRating
            })
        })
        .catch((err) => {
            console.log(err);
        })
}

// create books 
exports.createBook = async (req, res) => {

    let book = req.body
    
    // attach the logged in user id to the created book
    book.createdBy = req.authUser._id
    let saveBook = await this.saveBookToDb(book);
    if(saveBook) {
        return res.json({
            success: true,
            message:"Successfully created book",
            data: saveBook,
        })
    }
}

/**
 * randomly create a book
 * @param
 */
exports.createOneRandomBook = async(req, res, next) => {
    const randomBook = {
        name: faker.commerce.productName(),
        author: faker.name.findName(),
        publishedDate: faker.date.past(),
        averageRating: faker.random.number(),
    }
    try {
        // let saveRandomBook = await this.saveBookToDb(randomBook);
        let saveRandomBook = new Book(randomBook);

        // attach the userId to the book
        saveRandomBook.createdBy = req.authUser._id
        if(saveRandomBook) {
            return res.json({
                success: true,
                message:"Successfully created book randomly",
                data: saveRandomBook,
            })
        }
    } catch (error) {
        console.log(error);
    }
    
    
}

/**
 * save the new book to the DB
 * @param {*} body 
 * @return Promise
 */
exports.saveBookToDb = async body => {
    let book = await new Book(body);
    return new Promise((resolve, reject) => {
        book.save()
            .then((result) => {
                resolve(result);
            })
            .catch(err => {
                console.log(err);
                reject(err)
            })

    })
}

/**
 * find a book by a valid book id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} id 
 */
exports.fetchBookById = async(req, res, next, id) => {
    await Book.findById(id)
                .populate('createdBy', '_id name author')
                .exec((err, result) => {
                    
                    if(!result || err) {
                        return res.status(403).json({
                            error: err
                        })
                    }
                    // append the book details to the request
                    req.book = result
                    next();
                })
}

/**
 * get a book detail
 * @param {*} req 
 * @param {*} res 
 */
exports.getBookDetail =  (req, res) => {
    try {
        let book = req.book;
         Book.findOne(req.book._id)
            .populate("createdBy", "_id name author")
            .sort("createdAt")
            .exec( async(err, result) => {
                if (err) {
                    return res.status(400).json({
                        message: "Book not found",
                    })
                }

                // get average values
                let avgRating = await Rating.aggregate([
                    {
                        $group:
                            {
                               _id:"$bookId",
                                AverageValue: { 
                                    $avg: "$rating",
                                }
                            }
                    }
                ])
                // find the id of the book from the calculated average array
                const findAvg = avgRating.find(avg => avg._id.equals(req.book._id));
                const average = findAvg.AverageValue

                // update the averageValue
                result.averageRating = average
                
                res.json({
                    "result":result,
                    },
                )
            })
    } catch (error) {
        return res.status(403).json({
            message: "Could not fetch book details",
        })
    }

}

/**
 * Update a book detail
 * @param {object} req - request
 * @param {object} res - response
 */
exports.updateBookDetail = (req, res) => {
    

    let book = req.book
    // add the changes coming from body of request to the original req
    book = _.extend(book, req.body);

    book.save((err, result) => {
        if(err || !result){
            return res.status(403).json({
                error: err
            })
        }
        return res.json({
            message: "Book updated successfully",
            book: result
        })
    })
}

/**
 * delete a book
 * @param {object} req - request
 * @param {object} res - response
 */
exports.deleteBook = (req, res) => {
  

    let book = req.book;
    book.remove((err, deletedBook) => {
        if(err) {
            return res.status(403).json({
                success: false,
                error: err,
            })
        }
        return res.json({
            success: true,
            message: "Successfully deleted book"
        })
    })
}

exports.hasBookAuthorization = (req, res, next) => {
    // check if it was user that created the book
    let bookCreatorId = req.book.createdBy._id;
    let authenticatedUserId = req.authUser._id;

    if(!bookCreatorId.equals(authenticatedUserId)) {
        return res.status(403).json({
            message: "You are not authorized to perform this operation"
        })
    }
    next();
}
/**
 * Get the Id of the current authenticated user from the token sent for authorization
 * @param {*} req - request
 * @param {*} res - server response
 * @param {*} next - next middleware
 */
exports.getIdFromToken = async (req, res, next) => {
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
                        error: "Auth user details not found"
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

/**
 * Rate a book
 * @param {object} req - request 
 * @param res 
 */
exports.rateBook = async (req, res) => {
    let bookId = req.book._id;
    let authenticatedUserId = req.authUser._id;
    // console.log(req.authUser._id)
    let body = {
        bookId: bookId,
        userId: authenticatedUserId,
        rating: req.body.rating
    }
    // console.log(body)

    let rateBook = await new Rating(body)
    await rateBook.save((err, result) => {
        if(err) {
            res.status(403).json({
                error: err
            })
        }

        res.json({
            message: true,
            result: result
        })
    })



}