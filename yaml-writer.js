var _= require("lodash"),
  stream= require("stream"),
  util= require("util"),
  nunjucks= require("nunjucks")

module.exports= YamlWriter
module.exports.YamlWriter= YamlWriter

function YamlWriter(opts){
	if(!(this instanceof YamlWriter)){
		return new YamlWriter()
	}
	opts= opts||{}
	opts.objectMode= true
	//opts.encoding= "utf8"
	stream.Transform.call(this, opts)

	this.configure(opts)
}
util.inherits(YamlWriter, stream.Transform)
YamlWriter.prototype._transform= function(chunk,enc,cb){
	var stanza
	if(chunk instanceof Array){
		stanza= {}
		for(var i= 0; i< this.keys.length; ++i){
			var key= this.keys[i]
			stanza[key]= chunk[key]
			
		}
		this.template.render(stanza)
	}else{
		var stanza= _.clone(chunk)
	}
	stanza.comments= stanza.comments.join("\n")
	delete stanza.quoteValue
	stanza.stanza= stanza
	var render= this.template.render(stanza)
	this.push(render)
	cb()
}
YamlWriter.prototype.configure= function(opts){
	this.nunjucks= new nunjucks.Environment(new nunjucks.FileSystemLoader(".", true), {autoescape: false})
	var template= opts.template||"yaml.nun"
	this.template= this.nunjucks.getTemplate(template, true)
	this.keys= this.keys||["key","value"]

	this._readableState.objectMode = false;
	this._writableState.objectMode = true;
}
