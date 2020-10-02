module.exports={
  to:function(num,dp){
	  return Math.round(num*Math.pow(10,dp))/(Math.pow(10,dp));
  }
}