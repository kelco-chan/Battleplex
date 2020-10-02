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
  }
  
]