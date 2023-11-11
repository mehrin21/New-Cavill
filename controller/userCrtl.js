const mongoose = require('mongoose')
const User = require('../model/userModel')

const bcrypt = require('bcrypt')
const address = require('../model/addressdb')
const products = require('../model/productdb')
const categorydb = require('../model/categorydb')
const branddb = require('../model/branddb')
const { ObjectId } = mongoose.Types;
const cartdb = require('../model/cartdb')
const wishlistdb = require('../model/wishlistdb')
const bannerdb = require('../model/bannerdb')
const coupondb = require('../model/coupondb')
const orderdb = require('../model/orderdb')
const offerdb = require('../model/offerdb')
const walletdb = require('../model/walletdb')
// PASSWORD HASHING
const passwordHash = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 5)
        return passwordHash;
    } catch (error) {
        console.log(error.message)
    }
}

// HOME PAGE RENDERING
const index = async(req, res) => {
    const title = req.session.userID
    const product = await products.find({})
    
    if(title){
   const user = await User.findOne({_id:title})
   
   console.log("user" + user)
   console.log(user.fullname)
    res.render('index-1',{title:title,user:user,product:product})
    // console.log("session" + req.session)
    }else{
        res.render('index-1',{product:product,title:null})
    }

}

// login page get 
const login = ((req, res) => {
    const title = req.flash("title")
    if (req.session.userID) {
        res.redirect('/dashboard')
    } else {
        res.render('login', { title: title[0] ,session:null})
    }
})
// login post 
const Login_post = async (req, res) => {
    try {

        const findUser = await User.findOne({ email: req.body.email })

        if (findUser) {
            if (findUser.isBlock == 0) {
                const passwordmatch = await bcrypt.compare(req.body.password, findUser.password)
                if (passwordmatch) {
                    // req.flash("title","logged in")

                    req.session.userID = findUser.id
                    // console.log(req.session)
                    // console.log("id is created " + req.session.id)
                    // console.log("login successfully")
                    const user = await User.findOne({ _id: req.session.userID });
                    console.log(user)
                    res.redirect('/')


                } else {
                    res.render('login')
                    req.flash("title", "password incorrect")
                    console.log("login is not successfull")
                }
            } else {
                res.render('login', { message: "user is blocked" })
                console.log("username is blocked")
            }
        } else {
            // req.flash("title","username is incorrect")
            res.render('login')
            req.flash("title", "username is incorrect")
            console.log("username is not correct")
        }
    } catch (error) {
        console.log(error.message)
    }
}
// signup get
const signup = ((req, res) => {
    const session = null
    const title = req.flash("title")
    res.render('signup', { title: title[0] || "", session: session })
})
// signup post
const sign_post = async (req, res) => {
    console.log("sign up");
    try {
        const { fullname, email, phone, password, repassword } = req.body;
        console.log(req.body)
        // const fullname = req.body.username;

        const findUser = await User.findOne({ email: req.body.email })
        const findName = await User.findOne({ fullname: req.body.fullname })
        // console.log(findName)
        console.log("sinp");
        if (findUser) {
            console.log("User already exists");
            req.flash("title", "User Already Registered");
            res.redirect('/login')
            // Handle already registered user (e.g., redirect to login page with a message)
        }
        else {
            if (password == repassword) {
                const passwordH = await passwordHash(req.body.password)

                const data = new User({
                    fullname: fullname,
                    email: req.body.email,
                    phone: req.body.phone,
                    password: passwordH,
                    isBlock: 0

                });

                try {
                    console.log(data)

                    // console.log(valid)
                    const insertdata = await data.save();
                    console.log("User data saved successfully");
                    console.log(insertdata)

                    // Handle successful signup (e.g., redirect to login page with a success message)

                    if (insertdata) {
                        req.flash("title", "Successfully registered");
                        res.redirect('/login')
                    } else {
                        req.flash("title", "Registration Error");
                        res.redirect('/signup');
                    }
                } catch (error) {
                    console.log(error.message);


                }
            }
        }
    } catch (error) {
        console.error(error.message);
        // Handle the error appropriately (e.g., redirect to an error page)
    }
};
// product page rendering
const ProductMen = async (req, res) => {
    try {
        const title= req.session.userID
        const user = await User.findOne({_id:title})
        const product = await products.find({})
        const category = await categorydb.find({})
        const brand = await branddb.find({})

        console.log("passing" + product)
        res.render('category-4cols', { product: product,title:title,user:user, category: category, brand: brand, })

    } catch (error) {
        console.log(error.message)
    }

}
const ProductWomen = async (req, res) => {
    try {
        const title= req.session.userID
        const user = await User.findOne({_id:title})
        const product = await products.find({})
        const category = await categorydb.find({})
        const brand = await branddb.find({})

        console.log("passing" + product)
        res.render('womenproduct', { product: product,title:title,user:user, category: category, brand: brand, })

    } catch (error) {
        console.log(error.message)
    }

}

// DASHBOARD
const dashboard = async (req, res) => {
    
    console.log("poy")
    try {
        const title = req.session.userID;
      
        // Assuming session is the user's ID
        const user = await User.findOne({ _id: new ObjectId(req.session.userID) }).populate('address').exec();

        console.log(user)
        const cart = await cartdb.findOne({ userId: req.session.userID }).populate('product.product_id').exec()
        const wishlist = await wishlistdb.findOne({ userId: req.session.userID }).populate('product').exec()
        const order = await orderdb.find({ userId: req.session.userID }).populate('product.productId')
        const wallet = await walletdb.findOne({userid:req.session.userID})
        if (title) {



                res.render('dashboard', {
                    title: title,
                   
                    user: user,
                    order: order,
                    cart: cart,
                    wishlist: wishlist,
                    wallet:wallet
                });
           
        } else {
            // Handle case when user is not authenticated
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        // Handle other errors, such as sending an error page
    }
};
// address display page rendering
const get_address = async(req,res)=>{
    try {
        const title = req.session.userID
        if(title){
        const user = await User.findOne({ _id: new ObjectId(req.session.userID) }).populate('address').exec();
        console.log("address user " +user  )
        res.render('address',{title:title,user:user})
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}
// order
const cart = async (req,res)=>{
    try {
        const title= req.session.userID;
        if(title){
        const user = await User.findOne({ _id: new ObjectId(req.session.userID) }).populate('address').exec();
        const cart = await cartdb.findOne({ userId: req.session.userID }).populate('product.product_id').exec()
        res.render('mycart',{title:title,cart: cart,user:user})
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}
// GET-ADDRESS PAGE
const address_get = async(req,res)=>{
    try {
        const title =req.session.userID
        if(title){
        const user = await User.findOne({_id:title})
        res.render('addaddress',{title:title,user:user})
        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}

// ADDRESS TAB POST

const user_address = async (req, res) => {
    try {
        console.log("address", req.body);

        // Extract address data from req.body
        let fullname = req.body.fullname
        let houseno = req.body.houseno
        let street = req.body.street
        let state = req.body.state
        let pincode = req.body.pincode
        let phone = req.body.phone
        let email = req.body.email
        let customerid = req.session.userID;


        console.log(houseno)
        console.log(fullname)
        const exist = await address.findOne({
            fullname: fullname,
            houseno: houseno,
            street: street,
            state: state,
            pincode: pincode,
            phone: phone,
            email: email,
            customerid: customerid,
        })


        if (exist) {
            req.flash("title", "address is exist")
            res.redirect('/dashboard')
        } else {

            // Create a new address document
            const address_data = new address({
                fullname: fullname,
                houseno: houseno,
                street: street,
                state: state,
                pincode: pincode,
                phone: phone,
                email: email,
                customerid: customerid,
            });
            if (address_data) {
                console.log(address_data)
                // Save the address document
                const insert = await address_data.save();
                console.log(insert)
                // Add the address to the user's profile
                const addressId = new ObjectId(insert._id);
                console.log("addreid" + addressId)
                const addtoUserDb = await User.findByIdAndUpdate(
                    customerid,
                    { $addToSet: { address: [addressId] } },
                    { new: true }
                );
                res.send({ message: "address added" })

                console.log("Address added to user:", addtoUserDb);

                // Redirect or respond to the client as needed
                req.flash("title", "User address added successfully");
                res.redirect('/dashboard')

            } else {
                console.log("invalide address")
            }

        }
    } catch (error) {
        console.log(error.message)
    }
};
// UPDATE ADDRESS
const get_account = async(req,res)=>{
    try {
    const title = req.session.userID
    if(title){
    const user = await User.findOne({ _id: new ObjectId(req.session.userID) }).populate('address').exec();
    res.render('account',{title:title,user:user})
    }else{
        res.redirect('/')
    }
    } catch (error) {
        console.log(error.message)
    }
}

const update_address = async (req, res) => {
    console.log("update_address")
    try {
        console.log(req.body)
        let fullname = req.body.fullname
        let house = req.body.houseno
        let state = req.body.state
        let street = req.body.street
        let pincode = req.body.pincode
        let phone = req.body.phone
        let userid = req.session.userID
        let addressid = req.body.addressid

        // CHECKING IF THE ADDRESS ALREADY EXISTS
        const addressExists = await address.findOne({
            _id: addressid,
            fullname: fullname,
            houseno: house,
            street: street,
            state: state,
            pincode: pincode,
            phone: phone,
            customerid: userid


        })
        if (addressExists) {
            res.send({ message: "already exist" })
        } else {
            const update_address = await address.findByIdAndUpdate(addressid, {
                $set: {
                    fullname: fullname,
                    houseno: house,
                    street: street,
                    state: state,
                    pincode: pincode,
                    phone: phone,
                    customerid: userid,
                    addressid: addressid
                }
            }, { new: true })
            console.log("updated....")
            res.send({ message: "user detials updated" })
        }

    } catch (error) {
        console.log(error.message)
    }
}
// ADDRESS EDIT
const address_edit = async (req, res) => {
    try {
        //    console.log("going to address editing") 
        console.log(req.body)
        const fullname = req.body.fullname
        const house = req.body.house
        const street = req.body.street
        const state = req.body.state
        const pincode = req.body.pincode
        const phone = req.body.phone
        const edit_id = req.body.editaddress
        const userid = req.session.userID
        console.log(userid)

        const update_address = await address.findByIdAndUpdate(edit_id, {
            $set: {
                fullname: fullname,
                houseno: house,
                street: street,
                state: state,
                pincode: pincode,
                phone: phone,
                customerid: userid,
                addressid: edit_id
            }
        }, { new: true, upsert: true })
        res.send({ message: 'updated successfully' })
        // res.redirect('/dashboard')

        console.log("successfull")
    } catch (error) {
        console.log(error)
    }
}
// address delete
const delete_address = async (req, res) => {
    try {
        // console.log(req.body)
        const address_id = req.body.address
        console.log(address_id)
        const userid = req.session.userID
        console.log(userid)

        const deleteUser_address = await User.findOneAndUpdate(
            { _id: userid },
            { $pull: { address: address_id } },
            { new: true })

        res.json({ message: "deleted" })
    } catch (error) {
        console.log(error.message)
    }
}
//PRODUCT VIEWING
const view_product = async (req, res) => {
    try {
        const title = req.session.userID
        
        console.log(req.query.productid)
        if (title) {
            const user = await User.findOne({_id:title})
            const product = await products.findOne({ _id: req.query.productid })
            const Products = await products.find({})
            res.render('productview', { product: product, products: Products,title:title,user:user })
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message)
    }
}
// GET- CHECKOUT
const get_checkout = async (req, res) => {
    try {
        console.log("ethitund")
        const title = req.session.userID
        // console.log(session)
        if (title) {
            const cart = await cartdb.findOne({ userId: req.session.userID }).populate('product.product_id').exec()
            const user = await User.findOne({ _id: req.session.userID }).populate('address').exec()
            const banners = await bannerdb.findOne({})
            const coupons = await coupondb.find({})
            const walletData = await walletdb.findOne({userid:title})
            // console.log("walletdata " + walletData.balance )
            console.log("cart " + cart)
            if (cart) {
                if(walletData){
                res.render('checkout', {
                    title:title,
                    banners: banners,
                    user: user,
                    cart: cart,
                    coupons: coupons,
                    walletAmount:walletData.balance
                })
            }else{
                res.render('checkout', {
                    title:title,
                    banners: banners,
                    user: user,
                    cart: cart,
                    coupons: coupons,
                    walletAmount:0
                })
            }
            } else {
                // req.flash("title","your cart is empty")
                // res.redirect('/dashboard')
            }
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
    }
}
// COUPON
const validate_coupon = async (req, res) => {
    try {
        console.log("coupon")
        const couponcode = req.body.code
        const subtotal = req.body.amount
        const session = req.session.userID
        console.log(subtotal)
        const coupon = await coupondb.findOne({ name: couponcode })

        // checking the user is used or not in the order

        const currentDate = new Date();
        console.log(currentDate)
        if (coupon) {
            const check_coupon = await orderdb.find({ userId: session, coupon: couponcode });
            if (!check_coupon) {
                if (coupon.expiry > currentDate) {
                    const minimum = parseFloat(coupon.minimum);
                    if (subtotal >= minimum) {
                        const discount_amt = (subtotal * coupon.discount) / 100;
                        res.send({ msg: "1", discount: discount_amt });
                    } else {
                        res.send({ msg: "2", message: "Coupon is not applicable for this price" });
                    }
                } else {
                    res.send({ msg: "2", message: "Coupon has expired" });
                }
            } else {
                res.send({ msg: "2", message: "coupon is used" })
            }
        }
        } catch (error) {
            console.log(error.message)
        }
    }

// wishlist

    
// wallet 
const userWallet = async(req,res)=>{
    try {
      const title= req.session.userID
      if(title){
      const user = await User.findOne({_id:title})
      const wallet = await walletdb.findOne({userid:user._id})
      console.log("wallet " + wallet.balance)
      res.render('wallet',{title:title,wallet:wallet,user:user})
      }else{
        res.redirect('/login')
      }
    } catch (error) {
        console.log("wallet error " + error.message)
    }
}
const shop = async(req,res)=>{
    try {
        const title = req.session.userID
        const offer = await offerdb.find({})
        if(title){
            const user = await User.findOne({_id:title})
            res.render('offerlisting',{title:title,user:user,offer:offer})
        }else{
            res.render('offerlisting',{offer:offer,title:null})
        }
    } catch (error) {
        
    }
}
// LOGOUT
const user_logout = async (req, res) => {
        try {

            req.session.destroy();
            console.log("working")
            res.redirect('/')
        } catch (error) {
            console.log(error.message)
        }
    }
    module.exports = {
        index,
        login,
        Login_post,
        signup,
        sign_post,
        ProductMen,
        ProductWomen,
        dashboard,
        user_logout,
        user_address,
        get_account,
        update_address,
        address_edit,
        delete_address,
        get_address,
        address_get,
        get_checkout,
        view_product,
        userWallet,
        cart,
        shop,
        validate_coupon
    }