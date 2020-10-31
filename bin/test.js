const Paginator = require("../models/paginator");
paginator = new Paginator("post/index",10,3);
console.log(paginator.geturl(2));