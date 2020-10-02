class Itemify{
  constructor(shop){
    this.shop=shop;
  }
  itemify(fake){
    var i=this.shop.get(fake.name);
    i.number=fake.number;
    return i;
  }
  fakeify(real){
    return {
      number:real.number,
      name:real.name
    }
  }
}
module.exports=Itemify