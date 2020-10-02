Math.to = function(num,dp){
    return Math.round(num*Math.pow(10,dp))/(Math.pow(10,dp));
}
var c = require("./assets/console.js")
const deepclone = require('lodash.clonedeep');
var Page = require("./botcmd.js").Page;

class Item{
    constructor(name,price,description,number=0){
        this.name=name;
        this.price=price?price:0;
        this.description="";
        this.number=number;
    }
    details(){
        var str=`Item: ${this.name} \n Price: ${this.price} `;
        if(this.number){
            str+=`\nAmount: ${this.number}`
        }
        if(this.description){
            str+=`\n ${this.description}`;
        }
        return str;
    }
    from(obj){
        this.name=obj.name;
        this.price=obj.price;
        this.description=obj.description;
    }
}
class Weapon extends Item{
    constructor(name,price,description,dmg,crit){
        super(name,price,description);
        this.dmg=dmg;
        this.crit=crit;
    }
    from(obj){
        super.from(obj);
        this.dmg=obj.dmg;
        this.crit=obj.crit
    }
    details(){
        var str=super.details();
        str+=`\n Damage: ${this.dmg}\n `
        str+=`Critical: ${this.crit}% \n`
        return str;
    }
}
class Armour extends Item{
    constructor(name,price,description,protection){
        super(name,price,description);
        this.prot=protection;
    }
    from(obj){
        super.from(obj);
        this.prot=obj.prot;
    }
    details(){
        var str=super.details();
        str+=`Protection: ${this.prot} \n`
        return str;
    }
}
class UsableItem extends Item{
    constructor(name,price,description,effect){
        super(name,price,description);
        this.use=effect;
    }
    from(obj){
        super.from(obj);
        this.use=obj.use;
    }
}
class Shop{
    constructor(){
        this.inv=[];
    }
    add(item){
        this.inv.push(item);
        return this;
    }
    buy(coins,itemname,amt){
        var item=this.inv.filter(function(e){
            return e.name===itemname
        })[0];
        if(!item){
            return false;
        }
        var cost=amt*item.price;
        if(cost>coins){
            return false;
        }
        return {
            itemname:item.name,
            cost:cost,
            number:amt
        };
    }
    parseWeapons(obj){
        var list=obj;
        for(var i =0; i< list.length;i++){
            var w=new Weapon();
            w.from(list[i]);
            this.inv.push(w);
        }
    }
    parseItems(obj){
        var list=obj;
        for(var i =0; i< list.length;i++){
            var w;
            if(list[i].prot){
                w=new Armour();
            }else if(list[i].dmg){
                w = new Weapon();
            }else if(list[i].use){
                w=new UsableItem();
            }else{
                w = new Item();
            }
            w.from(list[i]);
            this.inv.push(w);
        }
    }
    list(pageNum){
        var page=new Page();
        var descriptions=this.inv.map((c)=>{return `${c.name} (\$${c.price} each) \n`})
        return page.show(pageNum,descriptions);
    }
    get(itemname){
        return this.inv.filter(function(e){
            return e.name===itemname;
        })[0]
    }
    itemify(fake){
        var i=this.get(fake.name);
        i.number=fake.number;
        return i;
    }
    fakeify(real){
        return {
            name:real.name,
            number:real.number,
        }
    }
}
var demo=new Shop();
demo.parseWeapons(require("../data/weapons.json"));
demo.parseItems(require("../data/items.js"));

function fakeify(real,n){
    return {
        name:real.name,
        number:(n?n:real.number)
    }
}
function itemify(fake){
    var i=demo.get(fake.name);
    i.number=fake.number;
    return i;
}
class Inventory{
    constructor(inv){
        this.inv=inv?inv:[];
    }
    invRemove(itemname,amount){
        var index=0;
        var item=this.inv.filter(function(ele,i){
            if(ele.name===itemname){
                index=i;
                return true;
            }
        })
        if((item.length!==1)|| (item.number<amount)){
            return false;
        }
        this.inv[index].number -= amount;
        if(this.inv[index].number===0){
            this.inv.splice(index,1);
        }
        return true;
    }
    invAdd(itemname,num){
        var number=parseInt(num);
        for (var i=0;i<this.inv.length;i++){
            if(this.inv[i].name===itemname){
                //matched expression - add item
                this.inv[i].number+=number;
                return true;
            }
        }
        this.inv.push({
            name:itemname,
            number:number
        });
    }
    invGet(itemname){
        var list = this.inv.filter(function(e){
            return e.name===itemname;
        })
        if(list[0]){
            return itemify(list[0]);
        }
        return false;
    }
    list(pageNum){
        var page=new Page();
        var dupeInv=deepclone(this.inv);
        return page.show(pageNum,dupeInv.map(function(item){
            return `${item.name} x${item.number}`+"\n";
        }))
    }
    from(l){
        var obj=l.inv;
        for(var i=0; i<obj.length;i++){
            var iter=obj[i];
            var temp=new Item();
            temp.from(iter);
            this.inv.push(fakeify(temp));
        }
    }
}

module.exports={
    Weapon:Weapon,
    Armour:Armour,
    UsableItem:UsableItem,
    Item:Item,
    Shop:Shop,
    Inventory:Inventory,
    fakeify:fakeify,
    itemify:itemify,
    items:demo
}