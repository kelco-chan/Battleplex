const m=require("./assets/math.js");
const c=require("./assets/console.js");
const entity=require("./entity.js");
class Action{
    constructor(type,fn){
        this.method=fn?fn:function(){};
        this.type=type?type:"Player";
    }
    run(person,ctx,args){
        c.show("Actions.run",person)
        return this.method.call(person,ctx,args);
    }
}
/*
*
* Ctx contains:
* shop, locations
*
*
* */
var actions={};
actions.buy=new Action("Player",function(ctx,args){
    var shop=ctx.shop;
    var gold=this.invGet("Gold Ingot");
    var coins=gold?gold.number:0;
    c.show("Buy Info:",args)
    var details=shop.buy(coins,args.itemname,args.amount);
    c.show("Transaction: ",details)
    if(details.itemname){
        this.invRemove("Gold Ingot",details.cost)
        this.invAdd(details.itemname,details.number);
        return {
            success:true,
            description:`Bought ${args.itemname} x${args.amount} for ${details.cost}`
        }
    }else{
        return {
            success:false,
            description: "Something went wrong"
        };
    }
});
actions.health=new Action("Player",function(){
    c.show("Actions.health",this)
    return {
        success:true,
        description:`You have ${m.to(this.stats.hp,1)} hp / ${this.stats.maxhp} hp left.`
    }
});
actions.use = new Action("Player", function(ctx,args){
    var item=ctx.shop.itemify(args.itemname);
    this.use(item);
    return {
        success:true,
        description:`Successfully used ${args.itemname}`
    }
})
actions.forage=new Action("Player",function(ctx){
    if(((!this.invGet("Axe"))&&(this.weapon.name!=="Axe"))){
        return {
            success:false,
            description:"I thought you needed an *axe* to chop trees"
        }
    }
    if(this._actionCooldown.forage>Date.now()){
        return {
            success:false,
            description: `Jeez. Wait ${(this._actionCooldown-Date.now())/1000} seconds till you chop down more trees.`
        }
    }
    if(!(ctx.locations[this.location].allows("forage"))){
        return {
            success:false,
            description: "There's no wood for you to chop, everyone else logged all trees. Go somewhere else"
        }
    }
    var number = Math.ceil(7*Math.random());
    this.invAdd("Wood",number);
    return {
        success:true,
        description: `You chopped down a tree and gained ${number} Wood.`
    }
});
actions.reset=new Action("Player",function(ctx,args){
    if(!args.confirmed){
        return {
            success:false,
            description:"Please run ```$reset pls``` to confirm that you want to reset"
        }
    }
    ctx.players[args.id]=new entity.Player([],[],{hp:100,maxhp:100},ctx.shop.get("Wooden Clubber"),ctx.shop.get("Your Skin"),args.id,"Noob's Rock");
    c.show("context in actions.js",ctx);
    return {
        success:true,
        description: "You are reset"
    };
})
actions.attack=new Action("Player",function (ctx){
    c.show("actions.attack",this)
    var location=ctx.locations[this.location];
    var dmg;
    if(location.allows('attack')){
        if((!this._agro) || (this._agro.stats.hp<1)){
            this._agro=location.pickMob();
        }
        //let the hostile mob take damage
        dmg=this.dealDamage();
        if(dmg.error){
            return `Oi. Wait for ur cooldown in ${(this._actionCooldown.attack-Date.now())/1000} seconds`;
        }
        this._agro.takeDamage(dmg,this);
        this.takeDamage(this._agro.dealDamage());
        if(this._agro.stats.hp<=0){
            //it is dead
            this.loot(this._agro.dropLoot())
            
            return `Your enemy has died and you got some loot`;
        }
        var enemyHp=m.to(this._agro.stats.hp,1);
        var enemyMax=m.to(this._agro.stats.maxhp,1)
        return `Your enemy has ${enemyHp}/${enemyMax} hp and you  dealt ${m.to(dmg,1)} dmg. You have ${this.stats.hp}/${this.stats.maxhp} hp left`;
    }else{
        return "There is nothing for you to attack here. Go somewhere else";
    }
    
})
actions.travel=new Action("Player",function(ctx,args){
    if(ctx.locations[args.destination]){
        this.location=args.destination;
        return {
            success:true,
            description:`You went to ${args.destination}`
        }
    }else{
        return {
            success:false,
            description:"no such location exists"
        }
    }
})
actions.inv = new Action("Player",function(ctx,args){
    c.show("inv before show",this.inv)
    var ret=this.list(parseInt(args.page));
    c.show("inv after show",this.inv)
    return {
        success:true,
        description:"```"+ret+"```"
    }
})
actions.fre = new Action("player",function(ctx,args){
    if(args.passcode!=="shavocado"){
        return {
            success:false,
            description:"No free lunch for you lol"
        }
    }
    this.invAdd("Gold Ingot",10000);
    return {
        success:true,
        description:"Hush."
    }
})
actions.use=new Action("Player",function(ctx,args){
    var item=this.invGet(args.itemname);
    if(!item){
        return {
            success:false,
            description:"YOU DONT EVEN HAV THE ITEM TF",
        };
    }
    this.use(item);
    return {
        success:true,
        description:"Finished using item"
    }
})
actions.equip=new Action("Player",function(ctx,args){
    var item=this.invGet(args.itemname);
    if(item){
        if(this.equip(item)){
            return {
                success:true,
                description:"Your item is equipped"
            };
        }else {
            return {
                success:false,
                description:"Something went wrong"
            }
        }
    }else{
        return {
            success:false,
            description:"You do not even have the item. I am not stupid."
        }
    }
})
actions.sell=new Action("player",function(ctx,args){
    c.show("Sell args", arguments)

    var item=ctx.shop.get(args.itemname);
    if(!item){
        return {
            success:false,
            description: "Hmmm. I don't think that item exists. Try again ```$sell 1 <itemname>```"
        }
    }
    var price=item.price;
    var avail=this.invGet(args.itemname);
    if(avail>=args.amount){
        this.invRemove(args.itemname,args.amount);
        this.invAdd("Gold Ingot",args.amount*price);
        return{
            success:true,
            description:`Sold ${args.amount} of ${args.itemname} for $${price*args.amount}. Stonks!`
        }
    }else{
        return {
            success:false,
            description:"BRUH YOU DON'T HAVE ENOUGH STUFF TO SELL!! S C A M M E R  A L E R T!"
        }
    }
})
actions.shop=new Action("Shop",function(ctx,args){
    var str="```"+ctx.shop.list(args.page)+"\n Use $item \<name\> to see item details!```";
    c.show(str);
    return {
        success:true,
        description:str
    };
})
actions.item=new Action("Shop",function(ctx,args){
    var description="```"+ctx.shop.get(args.itemname).details()+"```";
    return {
        success:true,
        description:description
    };
})
module.exports=actions;