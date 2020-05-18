const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

mongoose.connect("mongodb+srv://admin-saikat:test-123@cluster0-wpul9.mongodb.net/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
   useFindAndModify: false 
});

/*mongoose.connect("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});*/

const blogSchema = {
  name: String,
  cat: String,
  title: String,
  intro: String,
  message: String,
  timestamp: String,
  image: String,
  extension: String,
  code: String,
};

const FoodBlog = mongoose.model("FoodBlog", blogSchema);
const FitnessBlog = mongoose.model("FitnessBlog", blogSchema);
const TravelBlog = mongoose.model("TravelBlog", blogSchema);

var foodcount = 0,
  fitnesscount = 0,
  travelcount = 0;

var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/temp_uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});

var upload = multer({ storage: storage });

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

//TODO

//about routes
app.get("/about", function (req, res) {
  res.render("about");
});

function insertBlog(req, res) {
  var ext = path.extname(req.file.originalname).toLowerCase();
  const tempPath = req.file.path;
  const targetPath = __dirname + "/public/images/uploads/" + Date.now() + ext;

  if (ext === ".png" || ext === ".jpg") {
    fs.rename(tempPath, targetPath, (err) => {
      if (err) {
        return handleError(err, res);
      }

      if (res.status(200)) {
        var targetPath_mod = targetPath.substring(
          targetPath.length - 33,
          targetPath.length
        );

        if (req.body.cats === "food") {
          const newBlog = new FoodBlog({
            name: req.body.name,
            cat: req.body.cats,
            title: req.body.title,
            intro: req.body.intro,
            message: req.body.message,
            timestamp: req.body.date,
            image: targetPath_mod,
            extension: ext,
            code: req.body.code,
          });
          newBlog.save(function (err) {
            if (err) return handleError(err);
            // saved!
          });

          res.redirect("/home/food");
        }

        if (req.body.cats === "travel") {
          const newBlog = new TravelBlog({
            name: req.body.name,
            cat: req.body.cats,
            title: req.body.title,
            intro: req.body.intro,
            message: req.body.message,
            timestamp: req.body.date,
            image: targetPath_mod,
            extension: ext,
            code: req.body.code,
          });
          newBlog.save(function (err) {
            if (err) return handleError(err);
            // saved!
          });

          res.redirect("/home/travel");
        }

        if (req.body.cats === "fitness") {
          const newBlog = new FitnessBlog({
            name: req.body.name,
            cat: req.body.cats,
            title: req.body.title,
            intro: req.body.intro,
            message: req.body.message,
            timestamp: req.body.date,
            image: targetPath_mod,
            extension: ext,
            code: req.body.code,
          });

          newBlog.save(function (err) {
            if (err) return handleError(err);
            // saved!
          });

          res.redirect("/home/fitness");
        }
      }
    });
  } else {
    fs.unlink(tempPath, (err) => {
      if (err) return handleError(err, res);

      if (res.status(403)) {
        res.render("wrong_file",{title:"Please upload .png or .jpg files :("});
      }
    });
  }
}

function updateBlog(req, res) {
  if (req.body.code === req.body.oldcode) {

    var ext = path.extname(req.file.originalname).toLowerCase();
    const tempPath = req.file.path;
    const targetPath = __dirname + "/public/images/uploads/" + Date.now() + ext;
    if (ext === ".png" || ext === ".jpg") {
      fs.rename(tempPath, targetPath, (err) => {
        if (err) {
          return handleError(err, res);
        }

        if (res.status(200)) {
          var targetPath_mod = targetPath.substring(
            targetPath.length - 33,
            targetPath.length
          );

          req.body.image = targetPath_mod;
         

          if (req.body.cats === "food") {
           

            FoodBlog.findOneAndUpdate(
              { _id: req.body._id },
              req.body,
              { new: true },
              function (err, updatedBlog) {
                if (!err) {
                  if(updatedBlog!== null)
                  res.redirect("/home/food");
                  else
                  res.render("wrong_file",{title: "Change of category not allowed, create a new Blog instead"})
                } else console.log(err);
              }
            );
          }
          
        if (req.body.cats === "travel") {
          
          TravelBlog.findOneAndUpdate(
            { _id: req.body._id },
            req.body,
            { new: true },
            function (err, updatedBlog) {
              if (!err) {
                if(updatedBlog!== null)
                res.redirect("/home/travel");
                else
                res.render("wrong_file",{title: "Change of category not allowed, create a new Blog instead"})
              } else console.log(err);
            }
          );
        
        }

        if (req.body.cats === "fitness") {
         
          FitnessBlog.findOneAndUpdate(
            { _id: req.body._id },
            req.body,
            { new: true },
            function (err, updatedBlog) {
              if (!err) {
                if(updatedBlog!== null)
                res.redirect("/home/fitness");
                else
                res.render("wrong_file",{title: "Change of category not allowed, create a new Blog instead"})
              } else console.log(err);
            }
          );
        }

        } //code:200

      }); // rename
    } else {
      fs.unlink(tempPath, (err) => {
        if (err) return handleError(err, response);

        if (res.status(403)) {
          res.render("wrong_file",{title:"Please upload .png or .jpg files :("});
        }
      });
    }
  } else res.render("wrong_file",{title: "Authentication Failed"});
}

//compose routes
app
  .route("/compose")
  .get(function (req, res) {
    res.render("compose", { post: [] });
  })
  .post(upload.single("cover_image"), function (req, res) {
    if (req.body._id === "") {
      insertBlog(req, res);
    } else {
      updateBlog(req, res);
    }
  });

app.get("/compose/:blogid/:id", function (req, res) {
  var str = req.params.blogid;
  //var str= req.params.blogid.substring(0, req.params.blogid.length-1);
  if (str === "food") {
    FoodBlog.findById(req.params.id, function (err, doc) {
      if (!err) {
        res.render("compose", { post: doc });
      }
    });
  } else if (str === "travel") {
    TravelBlog.findById(req.params.id, function (err, doc) {
      if (!err) {
        res.render("compose", { post: doc });
      }
    });
  } else if (str === "fitness") {
    FitnessBlog.findById(req.params.id, function (err, doc) {
      if (!err) {
        res.render("compose", { post: doc });
      }
    });
  }
});
//single blog routes
app.get("/home/:category/:blogid", function (req, res) {
  var str = req.params.blogid;
  var num = Number(str.charAt(str.length - 1));

  if (req.params.category === "food") {
    FoodBlog.find({}, function (err, foundBlogs) {
      if (!err) {
        res.render("singleBlog", {
          posts: foundBlogs,
          index: num,
          href: "food",
        });
      } else res.send(err);
    });
  }
  if (req.params.category === "fitness") {
    FitnessBlog.find({}, function (err, foundBlogs) {
      if (!err) {
        res.render("singleBlog", {
          posts: foundBlogs,
          index: num,
          href: "fitness",
        });
      } else res.send(err);
    });
  }
  if (req.params.category === "travel") {
    TravelBlog.find({}, function (err, foundBlogs) {
      if (!err) {
        res.render("singleBlog", {
          posts: foundBlogs,
          index: num,
          href: "travel",
        });
      } else res.send(err);
    });
  }
});

//category routes
app.get("/home/:category", function (req, res) {
  if (req.params.category === "food") {
    FoodBlog.find({}, function (err, foundBlogs) {
      if (!err) {
        res.render("category_page", {
          data: req.params.category,
          posts: foundBlogs,
        });
      } else res.send(err);
    });
  }

  if (req.params.category === "fitness") {
    FitnessBlog.find({}, function (err, foundBlogs) {
      if (!err) {
        res.render("category_page", {
          data: req.params.category,
          posts: foundBlogs,
        });
      } else res.send(err);
    });
  }
  if (req.params.category === "travel") {
    TravelBlog.find({}, function (err, foundBlogs) {
      if (!err) {
        res.render("category_page", {
          data: req.params.category,
          posts: foundBlogs,
        });
      } else res.send(err);
    });
  }
});

//home routes
app.get("/home", function (req, res) {
  FoodBlog.find({}, function (err, foodBlogs) {
    if (!err) {
      FitnessBlog.find({}, function (err, fitnessBlogs) {
        if (!err) {
          TravelBlog.find({}, function (err, travelBlogs) {
            if (!err) {
              res.render("home", {
                foodBlogs: foodBlogs,
                fitnessBlogs: fitnessBlogs,
                travelBlogs: travelBlogs,
              });
            } else res.send(err);
          });
        } else res.send(err);
      });
    } else res.send(err);
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
