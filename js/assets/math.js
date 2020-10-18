module.exports={
    to:function(num,dp){
	    return Math.round(num*Math.pow(10,dp))/(Math.pow(10,dp));
    },
    chooseWeighted:function(items) {
        //https://stackoverflow.com/questions/55257022/choosing-random-weighted-object-from-an-array
        var cumul=1;
        var random = Math.floor(Math.random())
        for(var i = 0; i < items.length; i++) {
            cumul -= items[i].chance
            if (random >= cumul) {
                return items[i]
            }
        }
    }
}