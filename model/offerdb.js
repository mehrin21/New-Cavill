const mongoose = require('mongoose')


const offerSchema = mongoose.Schema({
    title :{
        type:String,
        required:true
    },
    brand: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    color:{
        type:String,
        required:true
     },
     image: {
         type: Array,
         required: true,
         validate: [arraylimit, "maximun 2 product image"]
     },
     category: {
        type: String,
        required: true,
    },
    category1: {
        type: String,
        required: true
    },
    offerpercentage:{
        type:String,
        required:true
    },
    expiry:{
        type:Date,
        required:true
    },
    size:{
            type:Array,
            required:true
        },
    offerprice:{
        type:String,
        required:true
    }
    })
function arraylimit(val) {
    return val.length <= 2

}
const offer = new mongoose.model("offers",offerSchema )

module.exports = offer
