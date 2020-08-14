const { Database } = require("quickmongo");

console.log('Thanks for using Mongo.Eco')

function Ecobase (mongoURL){
  if(!mongoURL) throw new Error('You are missing the MongoURL!')
  try{
    var db = new Database(mongoURL)
    this.db = db
  }catch (e) {
    throw new Error(`There's some mistake in values! Read the docs again. Error we got: ${e}`)
  }
}

Ecobase.prototype.set = function set (userID, value){
  if(!userID) throw new Error('You are missing the Message!')
  if(!value) throw new Error('You are missing the Value!')
  this.db.set(`money_${userID}`, value)
}

Ecobase.prototype.fetch = function fetch (userID){
  if(!userID) throw new Error('You are missing the Message!')
  return this.db.fetch(`money_${userID}`)
}

Ecobase.prototype.delete = function del (userID){
  if(!userID) throw new Error('You are missing the Message!')
  this.db.delete(`money_${userID}`)
}

Ecobase.prototype.add = function add (userID, value){
  if(!userID) throw new Error('You are missing the Message!')
  if(!value) throw new Error('You are missing the Value!')
  if((isNaN(value))) throw new Error('Value must be a number!')
  let money = this.db.fetch(`money_${userID}`)
  if(money == null) this.db.set(`money_${userID}`, 0)
  if(!(isNaN(money))) throw new Error(`You cant add ${typeof money} with a number!`)
  this.db.add(`money_${userID}`, value)
}

Ecobase.prototype.subtract = function subtract (userID, value){
  if(!userID) throw new Error('You are missing the Message!')
  if(!value) throw new Error('You are missing the Value!')
  if((isNaN(value))) throw new Error('Value must be a number!')
  let money = this.db.fetch(`money_${userID}`)
  if(money == null) this.db.set(`money_${userID}`, 0)
  if(!(isNaN(money))) throw new Error(`You cant subtract ${typeof money} with a number!`)
  this.db.subtract(`money_${userID}`, value)
}

Ecobase.prototype.mongo = function mongo (){
  return this.db
}

Ecobase.prototype.leaderboard = async function lb (limit, client, message, currency){
  if(!client) throw new Error('You are missing to enter Client!')
  if(!limit) throw new Error('You are missing the Limit!')
  if((isNaN(limit))) throw new Error('Limit must be a number!')
  if(!currency) currency = ':dollar:'
  const data = await this.db.startsWith("money_", { sort: ".data" });
  let members = message.guild.members.cache.map(m => m.id)
  async function fetchUser (idd) {
    let id = await client.users.fetch(idd)
    return id.username
  }
  var content = "", num = 0
  for(let i = 0; i < data.length; i++){
    try{
    let idlist = data[i], ids = idlist.ID.split('_')[1]
    let user = await fetchUser(ids)
    if(members.includes(ids)){
      var num = num + 1
      var content = `${content}\n${num}. ${user} ~ ${data[i].data} ${currency}`
    }
    if(num == limit) return
    }catch (e) {
      var num = num-1
    }
  }
  if(content == "") return "No data found..."
  return content
}

Ecobase.prototype.verify = async function verify (userID, value, type){
  if(!userID || !value || !type) throw new Error('You are missing to either enter User ID, Value or Type')
  if((isNaN(value))) throw new Error('Value must be a number!')
  let money = await this.db.fetch(`money_${userID}`)
  switch(type){
    default:
    throw new Error('Type must be ">", "<" or "="')
    break;
    case "<":
    if(money > value) return true
    return false
    break;
    case ">":
    if(money < value) return true
    return false
    break;
    case "=":
    if(money == value) return true
    return false
    break;
  }
}

Ecobase.prototype.reset = function reset (userID){
  if(!userID) throw new Error('You are missing to either enter User ID or Item')
  this.db.set(`money_${userID}`, 0)
}

// Shop Functions Start from here...

Ecobase.prototype.addItem = function addItem (userID, item){
  if(!userID || !item) throw new Error('You are missing to either enter User ID or Item')
  this.db.add(`inv_${userID}_${item}`, 1)
}

Ecobase.prototype.removeItem = function removeItem (userID, item){
  if(!userID || !item) throw new Error('You are missing to either enter User ID or Item')
  this.db.subtract(`inv_${userID}_${item}`, 1)
}

Ecobase.prototype.fetchItem = async function fetchItem (userID, item){
  if(!userID || !item) throw new Error('You are missing to either enter User ID or Item')
  let res = await this.db.fetch(`inv_${userID}_${item}`)
  return res
}

Ecobase.prototype.deleteItems = async function delItem (userID){
  if(!userID) throw new Error('You are missing to either enter User ID')
  let res = await this.db.startsWith
  (`inv_${userID}`)
  res.forEach(data => this.db.delete(data.ID))
}

module.exports.Ecobase = Ecobase;
module.exports.version = require('./package.json').version;
