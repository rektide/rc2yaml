var stream= require("stream"),
  util= require("util")

function RcReader(opts){
	if(!(this instanceof RcReader)){
		return new RcReader(opts)
	}
	opts= opts||{}
	opts.objectMode= true
	RcReader.super_.call(this, opts)
	this.configure(opts)
	this.first= false
}
util.inherits(RcReader, stream.Transform)
module.exports= RcReader
module.exports.RcReader= RcReader

RcReader.prototype._transform= function(chunk,enc,cb){
	var stanza= this.stanza||(this.stanza= {quoteValue: this.quoteValue}),
	  emit= false
	var comm= this.comment.exec(chunk)
	if(comm){
		var comms= stanza.comments||(stanza.comments= [])
		comms.push(comm[1])
	}
	var kv= comm?null:this.line.exec(chunk)
	if(kv){
		this._parseLine(kv, stanza)
		emit= true
	}
	var blank= comm||kv?null:this.blank.exec(chunk)
	if(chunk.toString("utf8")== ""){
		//console.log("!BLANK", this.blank)
	}
	if(blank){
		//console.log("BLANK", stanza.comments, this.commentedDefault)
	}
	if(blank && stanza.comments && this.commentedDefault){
		// some rc files have defaults in comments- try to parse
		var last= stanza.comments.pop(),
		  line= this.line.exec(last)
		if(line){
			this._parseLine(line, stanza)
			emit= true
		}
	}
	if(emit){
		this.push(stanza)
		this.stanza= null
	}
	cb()
}
RcReader.prototype.configure= function(opts){
	var chomp= opts.noChomp?"":"\\s*",
	  comments= "^"+chomp+(opts.comment||"#")+chomp+"(.*)",
	  line= "(.+?)"+chomp+(opts.lineSep||"\\s")+chomp+"(.*)",
	  blank= "^"+(opts.blank||chomp)+"$"
	  template= opts.template||"yaml.nun"
	if(opts.fullCommentExpr) comments= opts.comment

	this.comment= new RegExp(comments)
	this.line= new RegExp(line)
	this.blank= new RegExp(blank)
	this.commentedDefault= opts.commentedDefault!==undefined?opts.commentedDefault:true
	this.quoteValue= opts.quoteValue!==undefined?opts.quoteValue:true

	this._readableState.objectMode = true;
	this._writableState.objectMode = false;
}
RcReader.prototype._parseLine= function(line, dest){
	if(line && line.length >= 3){
		dest.key= line[1]
		dest.value= line[2].replace('"','\"')
	}
	return dest
}
