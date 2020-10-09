//jshint esversion:6

//Set up required tools
const bodyParser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");

//Set up Express.js
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//Connect the mongoDB database
mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useUnifiedTopology: true,
  useFindAndModify: false,
  useNewUrlParser: true
});

//Create DB Schema
const articleSchema = {
  title: {
    type: String,
    required: [true, "A title is required."]
  },
  content: {
    type: String,
    required: [true, "Article content is required."]
  }
};

//Compile DB schema into a model/collection
const Article = mongoose.model("Article", articleSchema);

//We can chain methods by using app.route to trim down the urlencoded.
//app.route for ALL articles
app.route("/articles")

.get(function(req, res) {
    Article.find({}, function(err, foundArticles) { //first parameter (conditions) intentionally left blank. can be omitted.
      if (!err) {
        res.send(foundArticles);
      } else {
        res.send(err);
      }
    });
  })

  .post(function(req, res) {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });

    newArticle.save(function(err) {
      if (!err) {
        res.send("Successfully added a new article.");
      } else {
        res.send(err);
      }
    });
  })

  .delete(function(req, res) {
    Article.deleteMany(function(err) { //omitted conditions (this deletes everything since there are no conditions specified)
      if (!err) {
        res.send("Successfully deleted all articles.");
      } else {
        res.send(err);
      }
    });
  });

//////////////////////////////////////////////////////
/////////app.route for SPECIFIC articles only/////////
//////////////////////////////////////////////////////


app.route("/articles/:articleTitle")

.get(function (req, res) {
  Article.findOne({title: req.params.articleTitle}, function(err, foundArticle) {
      if (foundArticle) {
        res.send(foundArticle)
      } else {
        res.send("No articles found.");
      }
  });
})

.put(function(req, res){
  Article.update(
    {title: req.params.articleTitle},
    {title: req.body.title, content: req.body.content},
    {overwrite: true},
    function(err, foundArticle){
      if (!err) {
        res.send("Successfully updated article.");
      } else {
        res.send(err);
      }
    });
})

.patch(function(req, res){
  Article.update(
    {title: req.params.articleTitle},
    {$set:  req.body},
    function(err, foundArticle){
      if (!err) {
        res.send("Successfully updated article.")
      } else {
        res.send(err);
      }
    }
  )
})

.delete(function (req,res){
  Article.deleteOne({title: req.params.articleTitle}, function(err) {
    if (!err) {
      res.send("Successfully deleted article.");
    } else {
      res.send(err);
    }
  })
});

//Listening Port
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
