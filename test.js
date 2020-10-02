/*var mongoose=require("mongoose");
mongoose.connect(process.env.URI, {useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on("error",function(e){
  console.warn(e);
});
console.log("test.js activated, starting test");*/
var entity=require("./js/entity.js");
const Items=require("./js/items.js");
var  c=require("./js/console.js")


var demoShop=new Items.Shop();
demoShop.add(new Items.Item("stick",1111,"a baguette"));
demoShop.add(new Items.Armour("he",100,"hw",0));
demoShop.add(new Items.Weapon("hi",10,"hi",20,0.1));

var TestPlayer=new entity.Player([],[],{
  location:Map.nest,
  maxhp:100,
  hp:100,
},demoShop.get("hi"),demoShop.get("he"),21094728487,Map.nest);
TestPlayer.invAdd(demoShop.get("stick"),1673687216386)
TestPlayer.invRemove("stick",1673687216385)

c.show("25",TestPlayer)