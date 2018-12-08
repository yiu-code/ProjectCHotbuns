var express = require("express");
var router = express.Router();
var Order = require("../models/order");
var Product = require("../models/product");
var User = require("../models/user");
var Coupon = require("../models/coupon");

var newName;

// De admin panel zelf. Heeft elke schema nodig omdat het alles gebruikt .
router.get("/admin/", isLoggedIn, function (req, res) {
    Product.find({}, function (error, allProducts) {
        User.find({}, function (err, allUsers) {
            Order.find({}, function (broke, allOrders) {
                Coupon.find({}, function (broke, allCoupons) {
                    if (error || err || broke) {
                        console.log(error)
                        console.log(err)
                        console.log(broke)
                    }
                    res.render("admin/panel", { product: allProducts, user: allUsers, order: allOrders, coupon: allCoupons })
                });
            });
        });
    });
});

//Pagina productbewerking.
router.put("/admin/modifyProduct", isLoggedIn, function (req, res) {
    Product.findById(req.body.product_id, function (err, givenProduct) {
        User.find({}, function (err, allUsers) {
            if (err) {
                console.log(err)
            }
            else {
                res.render("admin/modifyProduct", { product: givenProduct, user: allUsers })
            }
        });
    });
});

//Bewerk het product werkelijk.
router.post("/admin/finishModifyProduct", isLoggedIn, function (req, res) {
    Product.findByIdAndUpdate(req.body.product_id, { $set: { name: req.body.name, image: req.body.image, description: req.body.description, price: req.body.price, category: req.body.category, ingredients: req.body.ingredients, allergy: req.body.allergy } }, function (err, updateProduct) {
        if (err) {
            console.log(err);
            res.redirect("/admin/")
        }
        else {
            console.log("No Error, Updated?");
            res.redirect("/admin/")
        }
    })
});

//Delete een product.
router.put("/admin/deleteProduct", function (req, res) {
    Product.findByIdAndRemove(req.body.product_id, function (err) {
        if (err) {
            console.log(err);
            res.redirect(req.get("back"));
        } else {
            res.redirect(req.get("referer"));
        }
    });
});

//Pagina voor user modify
router.put("/admin/modifyUser", isLoggedIn, function (req, res) {
    User.findById(req.body.user_id, function (err, givenUser) {
        if (err) {
            console.log(err)
        }
        else {
            res.render("admin/modifyUser", { user: givenUser })
        }
    });
});

router.post("/admin/finishModifyUser", isLoggedIn, function (req, res) {
    newName = req.body.name.slice(0, -1); // Ducktape voor een bug.
    //Update de User. Niet het wachtwoord. "Security Reasons".
    User.findByIdAndUpdate(req.body.user_id, { $set: { username: req.body.username, email: req.body.email, name: newName, naamToevoeging: req.body.naamToevoeging, surname: req.body.surname, phonenumber: req.body.phonenumber, address: req.body.address } }, function (err, updateUser) {
        if (err) {
            console.log(err);
            res.redirect("/admin/")
        }
        else {
            console.log("No Error, Updated?");
            res.redirect("/admin/")
        }
    })
});

//Verwijder gebruiker.
router.put("/admin/deleteUser", function (req, res) {
    User.findByIdAndRemove(req.body.user_id, function (err) {
        if (err) {
            console.log(err);
            res.redirect(req.get("back"));
        } else {
            res.redirect(req.get("referer"));
        }
    });
});

//Maak een nieuwe user aan.
router.post("/admin/newUser", function (req, res) {
    User.register(new User({
        username: req.body.username,
        email: req.body.email,
        name: req.body.name,
        naamToevoeging: req.body.naamToevoeging,
        surname: req.body.surname,
        phonenumber: req.body.phonenumber,
        address: req.body.address
    }), req.body.password, function (error, user) {
        if (error) {
            console.log(error);
            req.flash("error", "Gebruikersnaam en/of e-mailadres bestaat al. Gebruik een andere gebruikersnaam of e-mailadres.");
            res.redirect("/admin/");
        }
        else {
            res.redirect("/admin/")
        }
    });
});

//Maak een nieuw product aan.
router.post("/admin/newProduct", function (req, res) {
    Product.create(
        new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: req.body.image,
            ingredients: req.body.ingredients,
            allergy: req.body.allergy
        }),
        req.flash('success', "Actie voltooid"),
        res.redirect("/admin/")
    )
});

// Verwijder een bestelling.
router.put("/admin/deleteOrder", function (req, res) {
    Order.findByIdAndRemove(req.body.order_id, function (err) {
        if (err) {
            console.log(err);
            res.redirect(req.get("back"));
        } else {
            res.redirect(req.get("referer"));
        }
    });
});

//Verwijder een coupon.
router.put("/admin/deleteCoupon", function (req, res) {
    Coupon.findByIdAndRemove(req.body.coupon_id, function (err) {
        if (err) {
            console.log(err);
            res.redirect(req.get("back"));
        } else {
            res.redirect(req.get("referer"));
        }
    });
});

//Maak een coupon aan.
router.post("/admin/makeACoupon", function (req, res) {
    Coupon.create(new Coupon({
        couponCode: req.body.couponCode,
        priceModifier: req.body.priceModifier
    }));

    req.flash('success', "Actie voltooid"),
        res.redirect("/admin/")
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login")
};
module.exports = router;
/////ADMIN TEMP SPOT///// -Vraag ff aan kimyu of hij een route kan maken, Mij lukt het niet-