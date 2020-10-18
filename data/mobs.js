var e=require("./../js/entity.js");
var c=require("./../js/assets/console.js")
var mobData=[
    {
        name:"Vampire",
        hp:10,
        cooldown:1000,
        weapon:{
            name:"Vampire Mouth",
            number:1
        },
        armour:{
            name:"Your Skin",
            number:1
        },
        loot:[
            {
                name:"Vampire Fang",
                low:0,
                high:1,
            },
            {
                name:"Gold Ingot",
                low:7,
                high:15
            }
        ]
    },
    {
        name:"Dragon",
        hp:1000,
        cooldown:1000,
        weapon:{
            name:"Dragon's Fang",
            number:1
        },
        armour:{
            name:"Dragon's Scale",
            number:1
        },
        loot:[
            {
                name:"Dragon's Scale",
                low:1,
                high:2,
            },
            {
                name:"Gold Ingot",
                low:10000,
                high:13000
            }
        ]
    },
    {
        name:"Undead Zombie",
        hp:50,
        cooldown:1000,
        weapon:{
            name:"Zombie Fist",
            number:1
        },
        armour:{
            name:"Your Skin",
            number:1
        },
        loot:[
            {
                name:"Gold Ingot",
                low:16,
                high:30
            }
        ]
    }
];
class Vampire extends e.Hostile{
    constructor(){
        super(mobData[0]);
    }
}
class Dragon extends e.Hostile{
    constructor(){
        super(mobData[1]);
    }
}
class UndeadZombie extends e.Hostile{
    constructor(){
        super(mobData[2]);
    }
}
module.exports={
    Vampire: Vampire,
    Dragon: Dragon,
    "Undead Zombie":UndeadZombie
}
