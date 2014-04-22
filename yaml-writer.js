var _= require("lodash"),
  fs= require("fs"),
  path= require("path"),
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
			stanza[key]= chunk[i]
			
		}
		this.template.render(stanza)
	}else{
		var stanza= _.clone(chunk)
	}
	if(stanza.comments)
		stanza.comments= stanza.comments.join("\n")
	delete stanza.quoteValue
	stanza.stanza= stanza
	var render= this.template.render(stanza)
	this.push(render)
	cb()
}
YamlWriter.prototype.configure= function(opts){
	var dir= process.argv[0]
	try{
		var node= "node"
		if(dir.lastIndexOf(node) == dir.length-node.length){
			root= path.dirname(process.argv[1])
			dir= fs.readlinkSync(process.argv[1])
			dir= path.dirname(dir)
			dir= path.resolve(root, dir)
		}
	}catch(ex){
	}
	this.nunjucks= new nunjucks.Environment(new nunjucks.FileSystemLoader(dir, true), {autoescape: false})
	var template= opts.template||"./yaml.nun"
	this.template= this.nunjucks.getTemplate(template, true)
	this.keys= opts.keys||["key","value"]

	this._readableState.objectMode = false;
	this._writableState.objectMode = true;
}
