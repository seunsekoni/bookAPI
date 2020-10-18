const Book = require('../models/book');
const faker = require('faker')

// fetch all books
exports.fetchBooks = (req, res) => {
    // console.log(req.auth);
    // console.log(req.user);
    // console.log(req.authUser);
    const books = Book.find()
        .then((getBooks) => {
            res.json({
                success: true,
                message:"Successfully fetched all books.",
                books: getBooks
            })
        })
        .catch((err) => {
            console.log(err);
        })
}

// randomly create books 
exports.createBook = async (req, res, next) => {
    let saveBook = await this.saveBookToDb(req.body);
    if(saveBook) {
        return res.json({
            success: true,
            message:"Successfully created book",
            data: saveBook,
        })
        
    }
}

exports.createOneRandomBook = async(req, res, next) => {
    const randomBook = {
        name: faker.commerce.productName(),
        author: faker.name.findName(),
        publishedDate: faker.date.past(),
        averageRating: faker.random.number(),
    }
    try {
        let saveRandomBank = await this.saveBookToDb(randomBook);
        if(saveRandomBank) {
            return res.json({
                success: true,
                message:"Successfully created book randomly",
                data: saveRandomBank,
            })
        }
    } catch (error) {
        console.log(error);
    }
    
    
}

exports.createManyRandomBook = async(numberOfData) => {
    const randomBook = {
        name: faker.commerce.productName(),
        author: faker.name.findName(),
        publishedDate: faker.date.past(),
        averageRating: faker.random.number(),
    }

    try {
        for (let index = 0; index < numberOfData; index++) {
        
        
        }
        let saveRandomBank = await this.saveBookToDb(randomBook);
        if(saveRandomBank) {
            return res.json({
                success: true,
                message:"Successfully created book randomly",
                data: saveRandomBank,
            })
        }
    } catch (error) {
        console.log(error);
    }
}

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




