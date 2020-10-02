
/*setup of constants */
const BOT_TOKEN = process.env.BOT_TOKEN;
var actions=require("./js/actions.js");
var Bot=require('./js/botcmd.js').Bot;
var mongoose=require("mongoose");
var entity=require("./js/entity.js");
var DB=require("./js/DB.js");
var locations=require("./js/map.js")();
var items=require("./js/items.js");
var shop=items.items;
var players={};
var c=require("./js/assets/console.js");
var m=require("./js/assets/math.js")

//init bot and mongodb;
var bot = new Bot('$');
mongoose.connect(process.env.URI, {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.connection.on("error",function(e){
  console.warn(e);
});


var ctx={
  shop:shop,
  locations:locations,
  players:{}
}

var saver=new DB.PlayerSave(); 
var loader=new DB.Loader();
loader.loadPlayers().then(function(val){
  ctx.players=val;
  c.show("LOADED PLAYERS",ctx.players);
});

async function middleware(msg,args){
  var player=ctx.players[msg.author.id];
  if(!player){
    return "Start a profile pls using $start";
  }
  msg.player=player;
  return msg;
}

bot.middleware(middleware);


bot.add('u', async ()=>{
  await saver.saveAll(ctx.players);
  return "Updated db;"
})
//player actions
bot.add("attack",async (msg,args)=>{
  return actions.attack.run(msg.player,ctx);
}).add("hp",async (msg)=>{
  return actions.health.run(msg.player,ctx).description;
}).add("travel",async function(msg,args) {
  return actions.travel.run(msg.player,ctx,{
    destination:args.join(" ")
  }).description;
}).add("buy",async function(msg,args){
    return actions.buy.run(msg.player,ctx,{
        amount:parseInt(args[0]),
        itemname:args.splice(1).join(" ")
    }).description;
}).add("inv", async function(msg,args){
    return actions.inv.run(msg.player,ctx,{
        page:args[0]?parseInt(args[0]):1,
    }).description;
}).add("use",async function(msg,args){
    return actions.use.run(msg.player,ctx,{
        itemname:args.join(" ")
    }).description
}).add("fre",async function(msg,args){
    return actions.fre.run(msg.player,ctx,{
        passcode:args[0]
    }).description
}).add("forage",async function(msg,args){
    return actions.forage.run(msg.player,ctx).description;
}).add("shop", async function(msg,args){
    return actions.shop.run(msg.player,ctx,{
        page:args[0]?parseInt(args[0]):1
    }).description;
})
//profile management
bot.add("reset",async function(msg,args){
    var exec=actions.reset.run(msg.player,ctx,{
        confirmed:(args[0]==="pls"),
        id:msg.author.id
    })
    return exec.description;
}).add("start",async function(msg,args){
    c.show("msg",msg)
    var id=msg.author.id;
    if(ctx.players[id]){
        return "Hey. You have a profile already";
    }
    ctx.players[id]=new entity.Player([],[],{hp:100,maxhp:100},items.items.get("Wooden Clubber"),items.items.get("Your Skin"),id,"Noob's Rock");
    console.log("Started player profile with id "+id)
    return "Nice. You started your journey";
},true).add("equip",function(msg,args){
    return actions.equip.run(msg.player,ctx,{
        itemname:args.join(" ")
    }).description
}).add("sell",function(msg,args){
    return actions.sell.run(msg.player,ctx,{
        amount:args[0],
        itemname:args.splice(1).join(" ")
    }).description;
}).add("item",function(msg,args){
    return actions.item.run({},ctx,{
        itemname:args.join(" ")
    }).description
})

/*
//market
//$give Player 1 Item
.add("give",async function(msg,args,player){
	var amountIndex=args.findIndexOf(c=>c instanceof Number),itemname,target;
	playername=args.map((v,i)=>{return i<amountIndex}),
	itemname=args.map((v,i)=>{return i>amountIndex});
	if(player.invGet(itemname)&&player.invGet(itemname)>=args[amountIndex]){}
	else return 
},middleware);



bot.add("dance",async function(msg,args,player){
	if(!locations[player.location].allows("dance")) return "Only noobs can dance properly. Go to Noob's Rock"
	player.stats.hp=player.stats.maxhp
	return "You have improved your cardiovascular fitness and thus you have returned to full health."
},middleware)
*/

bot.login(BOT_TOKEN);

//loop Codes
var save=setInterval(async function(){
  await saver.saveAll(ctx.players);
},1000*60*15)