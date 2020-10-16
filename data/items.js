module.exports=[
  {
    price:2,
    name:"Wood",
    description:"You get them from trees. Big Brain, Wright?"
  },
  {
    price:1,
    name:"Gold Ingot",
    description:"We couldn't make enough coins..."
  },
  {
    price:10,
    name:"Health Potion",
    description:"I guess it heals you?",
    use:function(){
	    this.stats.hp=Math.min(this.stats.hp+10,this.stats.maxhp);
    }
  },
  {
    name:"Your Skin",
    price:0,
    prot:1,
    description:"This is definitely a type of armour"
  },
  {
    name:"Axe",
    price:15,
    description:"You use this to chop trees"
  },{
      name:"Dragon's Scale",
      price:1000,
      prot:50,
      description:"This is found on the backs of dragon. Lots of dragons were killed in the making of ths armour"
  },{
      name:"Dragon's Fang",
      price:10000000,
      description:"The dragon attacks you in this way",
      dmg:100,
      crit:50
  }
  
]