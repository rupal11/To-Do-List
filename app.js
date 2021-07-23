const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const date=require(__dirname + "/date.js");
const _=require("lodash");

const app=express();

// const items=["Rupal"];
// const workItems=[];

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongoose.connect('mongodb://localhost:27017/todoListDB", {useNewUrlParser:true, useUnifiedTopology: true});

const itemsSchema={
  name : String
};

const Item=mongoose.model("item",itemsSchema);

const pencil= new Item({
  name:"Welcome!"
});

const pen= new Item({
  name:"Click + to insert an item."
});


const eraser= new Item({
  name:"Check box to delete the item."
});

const itemArray=[pencil,pen,eraser];

const listSchema={
  name:String,
  items :[itemsSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/",function(req,res){

  const day = date.getDate();

  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(itemArray,function(err){
        if(err)
         console.log(err);
        else 
         console.log("Success")
      });
      res.redirect("/");
    }
    else{
      res.render("list",{listTitle : day, newListItems : foundItems}); 
    }
   
    
  })
  
     
});


app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);

List.findOne({name:customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      //Create an new list
        const list = new List({
          name:customListName,
          items:itemArray
        });
        list.save();
        res.redirect("/" + customListName);
    }
    else{
      //Show an existing list
       res.render("list",{listTitle:foundList.name ,newListItems :foundList.items});
    }
  }
});


});



app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  
    const insertedItem=new Item({
      name:itemName
    });
    console.log(listName);
    if(listName=== date.getDate()){
      insertedItem.save();
      res.redirect("/");
      console.log("Saved to main list");
    } else{
        List.findOne({name:listName},function(err,foundList){
          foundList.items.push(insertedItem);
          foundList.save();
          res.redirect("/"+listName);
        });
    }
    
    
});

app.post("/delete",function(req,res){

const checkedItemId=req.body.checkbox;
const listName= req.body.listName;

if(listName=== date.getDate()){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(err)
     console.log(err);
    else 
     console.log("Successfully Deleted Checked Item")
     res.redirect("/")
  });
} else{
    List.findOneAndUpdate({name:listName} , {$pull : {items : {_id : checkedItemId} }} , function(err,foundList){
      if(!err)
        res.redirect("/"+listName);
    });
}


});

app.get("/about",function(req,res){
  res.render("about")
});

app.listen(3000,function(){
    console.log("Server started on port 3000.");
})
