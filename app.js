const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


// let items = ["Buy Food", "Cook Food", "Eat Food"];
// let workItems = [];

const app = express();
app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({extended:true}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Shubham:test123@cluster0.b2hk7.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser:true});

let today = new Date();
 
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    var day = today.toLocaleDateString("en-US", options);
    var year = today.getFullYear();

const itemsSchema = {
    name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todo list !"
});

// const item2 = new Item({
//     name: "Hit + to create new item"
// });

// const item3 = new Item({
//     name: "<-- Hit this to delete an item "
// });

const defaultItems = [item1];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){
    // let today = new Date();
 
    // let options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // }

    // var day = today.toLocaleDateString("en-US", options);

    Item.find({}, function(err, foundItems){
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err){
    if (err) {
        console.log(err);
    }
    else{
        console.log("Items successfully saved to DB");
    }
});
        res.redirect("/");
        }

        else{
            res.render('list', {listTitle: day, newListItems: foundItems, listYear: year});
        }
        
    })
    
});

app.post("/", function(req, res){
    let itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name : itemName
    });

    if (listName === day) {
        item.save();
        res.redirect("/");
    } else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
   
});

// app.get("/work", function(req, res){

//     res.render('list', {listTitle: "Work List", newListItems: workItems})
// });

app.get("/:customListNames", function(req, res){
    const customListNames = _.capitalize(req.params.customListNames);

    List.findOne({name:customListNames}, function(err, foundList){
        if (!err) {
            if (!foundList) {
                // create a list

                const list = new List({
                    name: customListNames,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/"+ customListNames);
            }
            else{
                res.render('list', {listTitle: foundList.name, newListItems: foundList.items, listYear: year});
            }
        }
    });

   
});


// app.post("/work", function(req, res){
//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// })

app.get("/about", function(req, res){
    res.render("about");
});

app.post("/delete", function(req, res){
    // let today = new Date();
    // let options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // }
    const checkedItemId = req.body.checkbox;  
    const listName = req.body.listName;
    console.log(listName);

    if (listName === day) {
        Item.findByIdAndRemove(checkedItemId, function(err){
            if (!err) {
                console.log("successfully deleted item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }

    
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is running on port 3000");
})