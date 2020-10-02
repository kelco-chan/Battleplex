let e=require("./entity.js");
var c = require("./assets/console.js")
const deepclone = require('lodash.clonedeep')
var Hostile = e.Hostile;

class Location{
	constructor(name,cmd){
		this.name=name;
		this.cmd=cmd//list
    this.entities=[];
	}
	allows(cmd){
		return (this.cmd.indexOf(cmd)>-1);
  }
  playerJoin(p){
    this.entities.push(p);
  }
  playerLeave(p){
    for(var i=0;i<this.entities.length;i++){
      if(this.entities[i].id==p.id){
        //we hav the user index
        this.entities.splice(i,1);
      }
    }
  }
  gc(){
    var del=[];
    for(var i=0;i<this.entities.length;i++){
      if(this.entities[i].stats.hp<1){
        del.push(i);
      }
    }
    for(var j=0;j<del.length;j++){
      this.entities.splice(del[j],1)
    }
  }
  pickMob(){
    var mobType=e[this.mobName];
    if(!mobType){
      mobType=e.Vampire;
    }
    this.gc();
    for(var i=0;i<this.entities.length;i++){
      //is there a entity
      if(this.entities[i].hostile && (!this.entities[i].agro)){
        //whoops a hostile mob
        return this.entities[i];
      }
    }
    //wow too peaceful, let us spawn some mobs
    this.entities.push(new mobType())
    return this.entities[0];
  }
}
//all definitions
var locations={};
locations.Forest = new Location("Forest",["chop","forage"]);
locations.Pond = new Location("Pond",["fish"]);
locations.Market = new Location("Market",["trade","sell","buy"]);
locations.Cemetry = new Location("Cemetry",["attack"]);
locations["Dragon's Nest"] = new Location("Dragon's Nest",["summon","attack"]);
locations["Noob's Rock"]=new Location("Noob's Rock",["dance","attack"])
module.exports=function(){
  return deepclone(locations);
}