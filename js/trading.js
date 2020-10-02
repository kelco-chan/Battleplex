class Auction{
	constructor(){
		this.trades=[];
	}
	//price,item,expire,amount,seller
	add(trade){
		this.trades.push(trade)
	}
	update(){
		
	}
	exec(id,buyer){
		var a=this.trades.findindexOf(curr=> curr.details.id===id)
		if(a===-1){
			return {value:"",err:"invalid ID"}
		}else if(buyer.invGet("Gold Ingot")<this.trades[a].price){
			return {value:"",err:"Not enough gold"}
		}else{
			buyer.invRemove("Gold Ingot",this.trades[a].price)
			buyer.invAdd(this.trades[a],this.trades[a].amount);
			this.trades[a].seller.invAdd(this.trades[a].price)
			this.trades=this.trades.splice(a);
		}
	}
	list(){
    var str=""
    for(var i=0;i<this.trades.length;i++){
      str+=`Trade  ID${this.trades[i].id}: \n\`\`\` ${this.trades[i].details()} \`\`\`\n`;
    }
    return str;
  }
}
class Trade{
	constructor(details,seller,id){
    /*
    Details:{
      itemname
      amount
      price
    }
     */
		this.seller=seller;
		this.details=details;
		this.id=id;
	}
  details(){
    return `${this.details.itemname} x${this.details.amount} at ${this.details.price} Gold Ingots Total`
  }
}

module.exports={};
module.exports.Auction=Auction;
mosule.exports.Auctionable=Auctionable;
module.exports.scemas={
	Auction:{
		tradeAmount:Number,
		trades:[Auctionable]
	},
	Auctionable:{
		expire:Number,
		amount:Number,
		item:Item,
		seller:Player,
		id:Number,
		price:Number
	}
};

