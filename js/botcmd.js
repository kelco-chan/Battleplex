//init discord and pg sql ** ADD THE PROCESS ENV VARS**
const deepclone=require("lodash.clonedeep");
const c= require("./assets/console.js")
const discord=require("discord.js");
class Bot {
	constructor(prefix){
		this.bot = new discord.Client("");
		this.middlewares=[];
		this.commands={};
		this.prefix=prefix;
		//init bot
		this.bot.on("message", async message => {
			if ((message.author.bot) || (message.channel.type === "dm")) {
				return; //we only support users irl on servers
			}
			if (message.content[0] !== this.prefix){
				return;
			}
			var command = message.content.split(" ")[0].substring(1);
			var args = message.content.split(" ").slice(1);
			var msg=message;
			var output;
			if(this.commands[command]){
				if (this.commands[command].bypass){
					output=await this.commands[command](message,args);
				}else{
					for(var i=0;i<this.middlewares.length;i++){
						msg= await this.middlewares[i](msg,args);
						if(!msg.content){
							return message.channel.send(msg);
						}
					}
				}
				output = await this.commands[command](msg,args);
				if(output){
					return message.channel.send(output);
				}
			}
		});
	}
	login(t){
		this.bot.login(t);
	}
	add(key,fn,bypass){
		this.commands[key]=fn;
		this.commands[key].bypass=bypass;
        return this;
	}
	middleware(middleware){
		this.middlewares.push(middleware);
		return this;
	}

}

class Page{
  constructor(number){
    this.number=number?number:5;//number of elements per Page
  }
  show(pageNumber,items){
    if(!pageNumber){
      return false;
    }
    var total=Math.ceil(items.length/this.number);
	//pageNumber=pageNumber%this.number
    var str=`Page ${pageNumber} of ${total}:\n`;
    var low=(pageNumber-1)*this.number;
    var high=(pageNumber)*this.number;//this index is excluded.
    var pageItems=items.slice(low,high)
    return str+pageItems.join("");
  }
}



module.exports = {
	Bot:Bot,
	Page:Page
};
