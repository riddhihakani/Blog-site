var express = require('express'),
app         = express(),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
bodyParser  = require('body-parser'),
mongoose    = require('mongoose');

//app config
mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser : true, useUnifiedTopology : true});
app.set('view engine','ejs')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
//app.use('/assets', express.static('assets'));
//mongoose/model config
var blogSchema = new mongoose.Schema({
    title : String,
    image : String,
    body : String,
    created : {type : Date, default : Date.now}
})

var Blog = mongoose.model("Blog",blogSchema);


// Blog.create({
//     title : 'test blog',
//     image : "https://images.unsplash.com/photo-1577380751926-16c582ac8364?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
//     body : "hello this is a blog post!"
// });
//restful routes

app.get("/", function(req,res){
   res.redirect('/blogs');
});

//index route
app.get("/blogs",function(req,res){
    Blog.find({}, function(err,blogs){
        if(err){
            console.log("error!")
        }else{
            res.render("index", {blogs : blogs})
        }
    });

});

//new route
app.get("/blogs/new",function(req,res){
    res.render("new");
});

//create route
app.post("/blogs",function(req,res){
    //create blog
    
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,function(err,newBlog){
        if(err){
            res.render("new");
        }else{
            //then,redirect to the index
            res.redirect("/blogs");
        }
    });
});


//show route
app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id, function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog : foundBlog});
        }
    })
});

//EDIT ROUTE
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit",{blog : foundBlog})
        }
    });
   
})

//UPDATE ROUTE
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);
        }
    })
});

//DELETE ROUTE
app.delete("/blogs/:id",function(req,res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs")
        }
    })
});




app.listen('5000',function(){
    console.log('server is running');
})