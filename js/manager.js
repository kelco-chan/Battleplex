const DB=require("./DB.js");
class Manager{
    constructor(){
        this.loader=new DB.Loader();
        this.saver=new DB.PlayerSave();
        this.players={};
    }
    async start(){
        this.players=await this.loader.loadPlayers();
    }
    async update(){
        await this.saver.saveAll(this.players);
    }
}