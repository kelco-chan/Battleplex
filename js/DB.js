var c=require("./assets/console.js")
const mongoose = require("mongoose");
var entity=require("./entity.js")
var locations=require("./map.js");
var schemas={};
var formats={};
formats.Item={
    name:String,
    number:Number
};
schemas.Item = new mongoose.Schema(formats.Item);

formats.Entity={
    inv:[schemas.Item],
    effects:[],
    stats:{
        hp:Number,
        maxhp:Number,
        prot:Number,
        crit:Number,
        dmg:Number
    },
    weapon:schemas.Item,
    armour:schemas.Item,
    id:String,
    location:String
};
schemas.Entity = new mongoose.Schema(formats.Entity);
formats.Player=formats.Entity;
schemas.Player = new mongoose.Schema(formats.Player);


var models={};
models.Item=mongoose.model('Item', schemas.Item)
models.Entity=mongoose.model('Entity', schemas.Entity);
models.Player=mongoose.model('Player', schemas.Player);
class Converter{
    constructor(){
        ;
    }
    extractItems(origin, format){
        var ret={};
        var requiredTags=Object.keys(format);
        for(var i=0;i<requiredTags.length;i++){
            ret[requiredTags[i]]=origin[requiredTags[i]];
        }
        return ret;
    }
    convert(type,obj){
        var format=formats[type];
        var ret=this.extractItems(obj,format);
        var reqModel=models[type];
        return new reqModel(ret);
    }
}
class Loader{
    constructor(){
        ;
    }
    async loadPlayers(){
        var find = new Promise((res,rej)=>{
            models.Player.find({},(err,data)=>{
                if(err){
                    rej(err);
                }else{
                    res(data);
                }
            })
        });
        var entries=await find;
        var ret={};
        for(var i=0;i<entries.length;i++){
            var temp=new entity.Player();
            temp.from(entries[i]);
            var id=entries[i].id;
            ret[id]=temp;
        }
        return ret;
    }
}
class EntitySave extends Converter{
    constructor(model,stringType){
        super();
        this.temp={};
        this.model=model;
        this.stringtype=stringType||"Entity";
    }
    async update(obj){
        //find obj to update first
        obj.updateStats();
        this.temp=this.convert(this.stringtype,obj);
        //delete old
        try{
            await this.model.deleteOne({id:obj.id});
        }catch(e){
            console.warn(e);
        }
        try{
            await this.temp.save();
        }catch(e){
            console.warn(e)
        }
        return "ok";
    }
    async saveAll(players){
        var list=Object.values(players);
        for(var i=0;i<list.length;i++){
            try{
                await this.update(list[i]);
            }catch(e){
                return false;
            }
        }
        return true;
    }
}
class PlayerSave extends EntitySave{
    constructor(){
        super(models.Player,"Player");
    }
}
module.exports={};
module.exports.formats=formats;
module.exports.models=models;
module.exports.Converter=Converter;
module.exports.Loader=Loader;
module.exports.EntitySave=EntitySave;
module.exports.PlayerSave=PlayerSave;
