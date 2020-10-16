module.exports={
    to:function(num,dp){
	    return Math.round(num*Math.pow(10,dp))/(Math.pow(10,dp));
    },
    chooseWeighted:function (items) {
        //total Weight is 1;
        var num = Math.random();
        var sum=0;
        for(var i = 0;i<items.length;i++){
            if(items[i].chance+sum<=num){
                //chance chosen;
                return items[i]
            }else{
                //chance not chosen;
                sum+=items[i].chance;
            }
        }
        
    }
}