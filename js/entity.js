var items=require("./items.js");
var Page=require("./botcmd.js").Page;
var c=require("./assets/console.js");
var shop=items.items;
var deepclone=require("lodash.clonedeep")
var m=require("./assets/math.js");
var itemify=require("./assets/itemify.js")
var i=new itemify(shop);
function random(min, max) {
  min = Math.ceil(min||0);
  max = Math.floor(max||1);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

//minion class
/*
*/
class Entity extends items.Inventory {
	constructor(inv,effects,stats,weapon,armour){
    /*Stats: location, dmg, hp, maxhp, prot,crit*/
    //prot is %
		super(inv);
		this.weapon=weapon;
		if(!this.weapon){
			this.weapon={crit:0,dmg:10};
		}
		this.armour=armour;
		if(!this.armour){
			this.armour={prot:0}
		}
		this.effects=effects;
		this.stats=stats;
    if(this.stats){
      this.stats.maxhp=this.stats.hp;
    }
    this._actionInterval={};
    this._actionInterval.attack=5000;
    this._actionInterval.forage=20000;
    this._actionCooldown={};
    this._actionCooldown.attack=Date.now();
    this._actionCooldown.forage=Date.now();
		
	}
  roundHp(){
    this.stats.maxhp=m.to(this.stats.maxhp,1)
    this.stats.hp=m.to(this.stats.hp,1)
  }
	dealDamage(){
        if(Date.now()<this._actionCooldown.attack){
            c.show("cooldown error")
            return {error:"COOLDOWN NOT DONE YET"};
        }
		this.updateStats();
		var dmg = this.stats.dmg || this.weapon.dmg;
		if(Math.random()<(this.stats.crit/100)){
			dmg*=2
		}
		dmg*=Math.to(Math.min(1,Math.pow(2.4,(this.stats.hp/this.stats.maxhp))-1),2);
		//damage is multiplied by (2.4^percent health remaining) -1; ** ROUNDED DOWN WHEN > 1
        this._actionCooldown.attack=Date.now()+this._actionInterval.attack;
		return m.to(dmg,1);
	}
	takeDamage(dmg){
		this.updateStats();
		dmg*=(1-(this.stats.prot/100));
        var realDmg=Math.abs(Math.to(dmg,1))
		this.stats.hp-=realDmg;
        this.roundHp();
	}
	updateStats(){
		var temp=this.stats.hp/this.stats.maxhp;
		//clear stats
		this.stats={hp:this.stats.hp,maxhp:this.stats.maxhp,crit:0,dmg:10,prot:0.05}
    
		//update stats by weapon
        var weapon=i.itemify(this.weapon);
		this.stats.dmg=weapon.dmg;
		this.stats.crit=weapon.crit;
		//update stats by armour
        var armour={};
		if(this.armour){
            armour=i.itemify(this.armour);
	        this.stats.prot=armour.prot;
			if(armour.hp){
				this.stats.maxhp+=armour.hp;
			}
		}
        this.stats.hp=temp*this.stats.maxhp
	}
    from(obj){
        var temp={};
        super.from(obj)
        this.effects=obj.effects;
        this.stats=obj.stats;
        this.weapon={name:obj.weapon.name,number:1}
        this.armour={name:obj.armour.name,number:1};
        this.location=obj.location;
        this.id=obj.id;
    }
}

class Player extends Entity	{
	constructor(inv,effects,stats,weapon,armour,id,loc){
		super(inv,effects,stats,weapon,armour);
    this.id=id;
    if(loc){
      if(!stats){
        this.stats={};
      }
      this.location=loc;
    }
	}
	use(item){
		if(!this.invRemove(item.name,1)){
			return;
		}
		if(i.itemify(item).use){
			i.itemify(item).use.call(this);
		}
		//so clean :=)
	}
	equip(item_){
    var item=i.itemify(item_);
		if(item.dmg){
			//equip weapon
			if(this.invRemove(item.name,1)){
				//add old weapon back in the inventory;
				this.invAdd(this.weapon.name,1);
				//set as new weapon
                this.weapon=item_;
				//update stats
				this.updateStats();
				return true;
			}
		}else if(item.prot){
			//equip armour
			if(this.invRemove(item.name,1)){
				//add old weapon back in the inventory;
				this.invAdd(this.armour.name,1);
				//set as new armour;
				this.armour=item_;
				this.updateStats();
				return true;
			}
		}
		return false;
	}
    loot(table){
        for(var i=0;i<table.length;i++){
        	var item=table[i];
            var number=item.number;
            this.invAdd(item.name,number);
        }
    }
}
// Mobs
class Hostile extends Entity{
	/*constructor(hp=2,weapon={name:"Wooden Clubber",number:1},armour={name:"Your Skin",number:1},loot=[{name:"Gold Ingot", high:5,low:5}],cooldown=1000*5)*/
    constructor(hp,weapon,armour,loot,cooldown){
		super([],[],{hp:hp, maxhp:hp,crit:0,dmg:1,prot:0},weapon,armour);
        this.agro=false;
        if(hp.hp){
            //the constructor passes and object;
            this.cooldown = hp.cooldown;
            this.name=hp.name;
            this.stats.hp=hp.hp;
            this.stats.maxhp=hp.hp;
            this.weapon=hp.weapon;
            this.armour=hp.armour;
            this.loot=hp.loot;
            this.updateStats();
            return;
        }
		
		this.cooldown=cooldown;
		this.nextAttack=Date.now()+this.cooldown;
        this.hostile=true;
        this.loot=loot;
        
        c.show("Init hostile",this)
	}
	ai(){
		if(this.agro){
			//attack player in agro
			if(Date.now()>this.nextAttack){
				this.agro.takeDamage(this.dealDamage());
				//also change next attack
				this.nextAttack=Date.now()+this.cooldown;
			}	
		}
		if(this.agro.stats.hp<=0){
			//enemy killed
			this.agro=false;
		}
		if(this.stats.hp<=0){
			//drop the weapon;
			this.agro.invAdd(this.weapon);
			//prepare for gc cleaning. R.I.P
		}
	}
	takeDamage(dmg,player){
		super.takeDamage(dmg);
		this.agro=player;
	}
  dropLoot(){
    var drop=[];
    for(var i=0;i<this.loot.length;i++){
      var low=this.loot[i].low;
      var high=this.loot[i].high;
      var amt=low+Math.floor(Math.random(high-low))
      drop.push({
        name:this.loot[i].name,
        number:amt
      })
    }
    return drop;
  }

}
class Vampire extends Hostile{
	constructor(){
		super(10,{name:"Vampire Mouth",number:1},{name:"Your Skin",number:1},[{
      name:"Vampire Fang",
      low:0,
      high:1,
    },{
      name:"Gold Ingot",
      low:7,
      high:15
    }],1000)
	}
}
/*

Stats:

location:obj
hp:num
maxhp:num
id:string
prot:numbercrit:number
dmg:number

*/
let exp={};
exp.Vampire=Vampire;
exp.Entity=Entity;
exp.Player=Player;
exp.Hostile=Hostile;
module.exports=exp;