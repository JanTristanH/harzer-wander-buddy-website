/**
 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 2.1.5
 * Copyright (C) 2017 Oliver Nightingale
 * @license MIT
 */
!function(){var e,t,r,i,n,s,o,a,u,l,d,h,c,f,p,y,m,g,x,v,w,k,Q,L,T,S,b,P,E,I,O,F,R=function(e){var t=new R.Builder;return t.pipeline.add(R.trimmer,R.stopWordFilter,R.stemmer),t.searchPipeline.add(R.stemmer),e.call(t,t),t.build()};R.version="2.1.5"
/*!
 * lunr.utils
 * Copyright (C) 2017 Oliver Nightingale
 */,R.utils={},R.utils.warn=(e=this,function(t){e.console&&console.warn&&console.warn(t)}),R.utils.asString=function(e){return null==e?"":e.toString()},R.FieldRef=function(e,t,r){this.docRef=e,this.fieldName=t,this._stringValue=r},R.FieldRef.joiner="/",R.FieldRef.fromString=function(e){var t=e.indexOf(R.FieldRef.joiner);if(-1===t)throw"malformed field ref string";var r=e.slice(0,t),i=e.slice(t+1);return new R.FieldRef(i,r,e)},R.FieldRef.prototype.toString=function(){return null==this._stringValue&&(this._stringValue=this.fieldName+R.FieldRef.joiner+this.docRef),this._stringValue},R.idf=function(e,t){var r=0;for(var i in e)"_index"!=i&&(r+=Object.keys(e[i]).length);var n=(t-r+.5)/(r+.5);return Math.log(1+Math.abs(n))},R.Token=function(e,t){this.str=e||"",this.metadata=t||{}},R.Token.prototype.toString=function(){return this.str},R.Token.prototype.update=function(e){return this.str=e(this.str,this.metadata),this},R.Token.prototype.clone=function(e){return e=e||function(e){return e},new R.Token(e(this.str,this.metadata),this.metadata)}
/*!
 * lunr.tokenizer
 * Copyright (C) 2017 Oliver Nightingale
 */,R.tokenizer=function(e){if(null==e||null==e)return[];if(Array.isArray(e))return e.map((function(e){return new R.Token(R.utils.asString(e).toLowerCase())}));for(var t=e.toString().trim().toLowerCase(),r=t.length,i=[],n=0,s=0;n<=r;n++){var o=n-s;(t.charAt(n).match(R.tokenizer.separator)||n==r)&&(o>0&&i.push(new R.Token(t.slice(s,n),{position:[s,o],index:i.length})),s=n+1)}return i},R.tokenizer.separator=/[\s\-]+/
/*!
 * lunr.Pipeline
 * Copyright (C) 2017 Oliver Nightingale
 */,R.Pipeline=function(){this._stack=[]},R.Pipeline.registeredFunctions=Object.create(null),R.Pipeline.registerFunction=function(e,t){t in this.registeredFunctions&&R.utils.warn("Overwriting existing registered function: "+t),e.label=t,R.Pipeline.registeredFunctions[e.label]=e},R.Pipeline.warnIfFunctionNotRegistered=function(e){e.label&&e.label in this.registeredFunctions||R.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n",e)},R.Pipeline.load=function(e){var t=new R.Pipeline;return e.forEach((function(e){var r=R.Pipeline.registeredFunctions[e];if(!r)throw new Error("Cannot load unregistered function: "+e);t.add(r)})),t},R.Pipeline.prototype.add=function(){Array.prototype.slice.call(arguments).forEach((function(e){R.Pipeline.warnIfFunctionNotRegistered(e),this._stack.push(e)}),this)},R.Pipeline.prototype.after=function(e,t){R.Pipeline.warnIfFunctionNotRegistered(t);var r=this._stack.indexOf(e);if(-1==r)throw new Error("Cannot find existingFn");r+=1,this._stack.splice(r,0,t)},R.Pipeline.prototype.before=function(e,t){R.Pipeline.warnIfFunctionNotRegistered(t);var r=this._stack.indexOf(e);if(-1==r)throw new Error("Cannot find existingFn");this._stack.splice(r,0,t)},R.Pipeline.prototype.remove=function(e){var t=this._stack.indexOf(e);-1!=t&&this._stack.splice(t,1)},R.Pipeline.prototype.run=function(e){for(var t=this._stack.length,r=0;r<t;r++){var i=this._stack[r];e=e.reduce((function(t,r,n){var s=i(r,n,e);return void 0===s||""===s?t:t.concat(s)}),[])}return e},R.Pipeline.prototype.runString=function(e){var t=new R.Token(e);return this.run([t]).map((function(e){return e.toString()}))},R.Pipeline.prototype.reset=function(){this._stack=[]},R.Pipeline.prototype.toJSON=function(){return this._stack.map((function(e){return R.Pipeline.warnIfFunctionNotRegistered(e),e.label}))}
/*!
 * lunr.Vector
 * Copyright (C) 2017 Oliver Nightingale
 */,R.Vector=function(e){this._magnitude=0,this.elements=e||[]},R.Vector.prototype.positionForIndex=function(e){if(0==this.elements.length)return 0;for(var t=0,r=this.elements.length/2,i=r-t,n=Math.floor(i/2),s=this.elements[2*n];i>1&&(s<e&&(t=n),s>e&&(r=n),s!=e);)i=r-t,n=t+Math.floor(i/2),s=this.elements[2*n];return s==e||s>e?2*n:s<e?2*(n+1):void 0},R.Vector.prototype.insert=function(e,t){this.upsert(e,t,(function(){throw"duplicate index"}))},R.Vector.prototype.upsert=function(e,t,r){this._magnitude=0;var i=this.positionForIndex(e);this.elements[i]==e?this.elements[i+1]=r(this.elements[i+1],t):this.elements.splice(i,0,e,t)},R.Vector.prototype.magnitude=function(){if(this._magnitude)return this._magnitude;for(var e=0,t=this.elements.length,r=1;r<t;r+=2){var i=this.elements[r];e+=i*i}return this._magnitude=Math.sqrt(e)},R.Vector.prototype.dot=function(e){for(var t=0,r=this.elements,i=e.elements,n=r.length,s=i.length,o=0,a=0,u=0,l=0;u<n&&l<s;)(o=r[u])<(a=i[l])?u+=2:o>a?l+=2:o==a&&(t+=r[u+1]*i[l+1],u+=2,l+=2);return t},R.Vector.prototype.similarity=function(e){return this.dot(e)/(this.magnitude()*e.magnitude())},R.Vector.prototype.toArray=function(){for(var e=new Array(this.elements.length/2),t=1,r=0;t<this.elements.length;t+=2,r++)e[r]=this.elements[t];return e},R.Vector.prototype.toJSON=function(){return this.elements}
/*!
 * lunr.stemmer
 * Copyright (C) 2017 Oliver Nightingale
 * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
 */,R.stemmer=(t={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},r={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},o="^("+(n="[^aeiou][^aeiouy]*")+")?"+(s=(i="[aeiouy]")+"[aeiou]*")+n+"("+s+")?$",a="^("+n+")?"+s+n+s+n,u="^("+n+")?"+i,l=new RegExp("^("+n+")?"+s+n),d=new RegExp(a),h=new RegExp(o),c=new RegExp(u),f=/^(.+?)(ss|i)es$/,p=/^(.+?)([^s])s$/,y=/^(.+?)eed$/,m=/^(.+?)(ed|ing)$/,g=/.$/,x=/(at|bl|iz)$/,v=new RegExp("([^aeiouylsz])\\1$"),w=new RegExp("^"+n+i+"[^aeiouwxy]$"),k=/^(.+?[^aeiou])y$/,Q=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,L=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,T=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,S=/^(.+?)(s|t)(ion)$/,b=/^(.+?)e$/,P=/ll$/,E=new RegExp("^"+n+i+"[^aeiouwxy]$"),I=function(e){var i,n,s,o,a,u,I;if(e.length<3)return e;if("y"==(s=e.substr(0,1))&&(e=s.toUpperCase()+e.substr(1)),a=p,(o=f).test(e)?e=e.replace(o,"$1$2"):a.test(e)&&(e=e.replace(a,"$1$2")),a=m,(o=y).test(e)){var O=o.exec(e);(o=l).test(O[1])&&(o=g,e=e.replace(o,""))}else a.test(e)&&(i=(O=a.exec(e))[1],(a=c).test(i)&&(u=v,I=w,(a=x).test(e=i)?e+="e":u.test(e)?(o=g,e=e.replace(o,"")):I.test(e)&&(e+="e")));return(o=k).test(e)&&(e=(i=(O=o.exec(e))[1])+"i"),(o=Q).test(e)&&(i=(O=o.exec(e))[1],n=O[2],(o=l).test(i)&&(e=i+t[n])),(o=L).test(e)&&(i=(O=o.exec(e))[1],n=O[2],(o=l).test(i)&&(e=i+r[n])),a=S,(o=T).test(e)?(i=(O=o.exec(e))[1],(o=d).test(i)&&(e=i)):a.test(e)&&(i=(O=a.exec(e))[1]+O[2],(a=d).test(i)&&(e=i)),(o=b).test(e)&&(i=(O=o.exec(e))[1],a=h,u=E,((o=d).test(i)||a.test(i)&&!u.test(i))&&(e=i)),a=d,(o=P).test(e)&&a.test(e)&&(o=g,e=e.replace(o,"")),"y"==s&&(e=s.toLowerCase()+e.substr(1)),e},function(e){return e.update(I)}),R.Pipeline.registerFunction(R.stemmer,"stemmer")
/*!
 * lunr.stopWordFilter
 * Copyright (C) 2017 Oliver Nightingale
 */,R.generateStopWordFilter=function(e){var t=e.reduce((function(e,t){return e[t]=t,e}),{});return function(e){if(e&&t[e.toString()]!==e.toString())return e}},R.stopWordFilter=R.generateStopWordFilter(["a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"]),R.Pipeline.registerFunction(R.stopWordFilter,"stopWordFilter")
/*!
 * lunr.trimmer
 * Copyright (C) 2017 Oliver Nightingale
 */,R.trimmer=function(e){return e.update((function(e){return e.replace(/^\W+/,"").replace(/\W+$/,"")}))},R.Pipeline.registerFunction(R.trimmer,"trimmer")
/*!
 * lunr.TokenSet
 * Copyright (C) 2017 Oliver Nightingale
 */,R.TokenSet=function(){this.final=!1,this.edges={},this.id=R.TokenSet._nextId,R.TokenSet._nextId+=1},R.TokenSet._nextId=1,R.TokenSet.fromArray=function(e){for(var t=new R.TokenSet.Builder,r=0,i=e.length;r<i;r++)t.insert(e[r]);return t.finish(),t.root},R.TokenSet.fromClause=function(e){return"editDistance"in e?R.TokenSet.fromFuzzyString(e.term,e.editDistance):R.TokenSet.fromString(e.term)},R.TokenSet.fromFuzzyString=function(e,t){for(var r=new R.TokenSet,i=[{node:r,editsRemaining:t,str:e}];i.length;){var n,s,o,a=i.pop();if(a.str.length>0)(s=a.str.charAt(0))in a.node.edges?n=a.node.edges[s]:(n=new R.TokenSet,a.node.edges[s]=n),1==a.str.length?n.final=!0:i.push({node:n,editsRemaining:a.editsRemaining,str:a.str.slice(1)});if(a.editsRemaining>0&&a.str.length>1)(s=a.str.charAt(1))in a.node.edges?o=a.node.edges[s]:(o=new R.TokenSet,a.node.edges[s]=o),a.str.length<=2?o.final=!0:i.push({node:o,editsRemaining:a.editsRemaining-1,str:a.str.slice(2)});if(a.editsRemaining>0&&1==a.str.length&&(a.node.final=!0),a.editsRemaining>0&&a.str.length>=1){if("*"in a.node.edges)var u=a.node.edges["*"];else{u=new R.TokenSet;a.node.edges["*"]=u}1==a.str.length?u.final=!0:i.push({node:u,editsRemaining:a.editsRemaining-1,str:a.str.slice(1)})}if(a.editsRemaining>0){if("*"in a.node.edges)var l=a.node.edges["*"];else{l=new R.TokenSet;a.node.edges["*"]=l}0==a.str.length?l.final=!0:i.push({node:l,editsRemaining:a.editsRemaining-1,str:a.str})}if(a.editsRemaining>0&&a.str.length>1){var d,h=a.str.charAt(0),c=a.str.charAt(1);c in a.node.edges?d=a.node.edges[c]:(d=new R.TokenSet,a.node.edges[c]=d),1==a.str.length?d.final=!0:i.push({node:d,editsRemaining:a.editsRemaining-1,str:h+a.str.slice(2)})}}return r},R.TokenSet.fromString=function(e){for(var t=new R.TokenSet,r=t,i=!1,n=0,s=e.length;n<s;n++){var o=e[n],a=n==s-1;if("*"==o)i=!0,t.edges[o]=t,t.final=a;else{var u=new R.TokenSet;u.final=a,t.edges[o]=u,t=u,i&&(t.edges["*"]=r)}}return r},R.TokenSet.prototype.toArray=function(){for(var e=[],t=[{prefix:"",node:this}];t.length;){var r=t.pop(),i=Object.keys(r.node.edges),n=i.length;r.node.final&&e.push(r.prefix);for(var s=0;s<n;s++){var o=i[s];t.push({prefix:r.prefix.concat(o),node:r.node.edges[o]})}}return e},R.TokenSet.prototype.toString=function(){if(this._str)return this._str;for(var e=this.final?"1":"0",t=Object.keys(this.edges).sort(),r=t.length,i=0;i<r;i++){var n=t[i];e=e+n+this.edges[n].id}return e},R.TokenSet.prototype.intersect=function(e){for(var t=new R.TokenSet,r=void 0,i=[{qNode:e,output:t,node:this}];i.length;){r=i.pop();for(var n=Object.keys(r.qNode.edges),s=n.length,o=Object.keys(r.node.edges),a=o.length,u=0;u<s;u++)for(var l=n[u],d=0;d<a;d++){var h=o[d];if(h==l||"*"==l){var c=r.node.edges[h],f=r.qNode.edges[l],p=c.final&&f.final,y=void 0;h in r.output.edges?(y=r.output.edges[h]).final=y.final||p:((y=new R.TokenSet).final=p,r.output.edges[h]=y),i.push({qNode:f,output:y,node:c})}}}return t},R.TokenSet.Builder=function(){this.previousWord="",this.root=new R.TokenSet,this.uncheckedNodes=[],this.minimizedNodes={}},R.TokenSet.Builder.prototype.insert=function(e){var t,r=0;if(e<this.previousWord)throw new Error("Out of order word insertion");for(var i=0;i<e.length&&i<this.previousWord.length&&e[i]==this.previousWord[i];i++)r++;this.minimize(r),t=0==this.uncheckedNodes.length?this.root:this.uncheckedNodes[this.uncheckedNodes.length-1].child;for(i=r;i<e.length;i++){var n=new R.TokenSet,s=e[i];t.edges[s]=n,this.uncheckedNodes.push({parent:t,char:s,child:n}),t=n}t.final=!0,this.previousWord=e},R.TokenSet.Builder.prototype.finish=function(){this.minimize(0)},R.TokenSet.Builder.prototype.minimize=function(e){for(var t=this.uncheckedNodes.length-1;t>=e;t--){var r=this.uncheckedNodes[t],i=r.child.toString();i in this.minimizedNodes?r.parent.edges[r.char]=this.minimizedNodes[i]:(r.child._str=i,this.minimizedNodes[i]=r.child),this.uncheckedNodes.pop()}}
/*!
 * lunr.Index
 * Copyright (C) 2017 Oliver Nightingale
 */,R.Index=function(e){this.invertedIndex=e.invertedIndex,this.fieldVectors=e.fieldVectors,this.tokenSet=e.tokenSet,this.fields=e.fields,this.pipeline=e.pipeline},R.Index.prototype.search=function(e){return this.query((function(t){new R.QueryParser(e,t).parse()}))},R.Index.prototype.query=function(e){var t=new R.Query(this.fields),r=Object.create(null),i=Object.create(null),n=Object.create(null);e.call(t,t);for(var s=0;s<t.clauses.length;s++){var o=t.clauses[s],a=null;a=o.usePipeline?this.pipeline.runString(o.term):[o.term];for(var u=0;u<a.length;u++){var l=a[u];o.term=l;for(var d=R.TokenSet.fromClause(o),h=this.tokenSet.intersect(d).toArray(),c=0;c<h.length;c++)for(var f=h[c],p=this.invertedIndex[f],y=p._index,m=0;m<o.fields.length;m++){var g=o.fields[m],x=p[g],v=Object.keys(x),w=f+"/"+g;if(void 0===i[g]&&(i[g]=new R.Vector),i[g].upsert(y,1*o.boost,(function(e,t){return e+t})),!n[w]){for(var k=0;k<v.length;k++){var Q,L=v[k],T=new R.FieldRef(L,g),S=x[L];void 0===(Q=r[T])?r[T]=new R.MatchData(f,g,S):Q.add(f,g,S)}n[w]=!0}}}}var b=Object.keys(r),P=[],E=Object.create(null);for(s=0;s<b.length;s++){var I,O=R.FieldRef.fromString(b[s]),F=O.docRef,_=this.fieldVectors[O],N=i[O.fieldName].similarity(_);if(void 0!==(I=E[F]))I.score+=N,I.matchData.combine(r[O]);else{var C={ref:F,score:N,matchData:r[O]};E[F]=C,P.push(C)}}return P.sort((function(e,t){return t.score-e.score}))},R.Index.prototype.toJSON=function(){var e=Object.keys(this.invertedIndex).sort().map((function(e){return[e,this.invertedIndex[e]]}),this),t=Object.keys(this.fieldVectors).map((function(e){return[e,this.fieldVectors[e].toJSON()]}),this);return{version:R.version,fields:this.fields,fieldVectors:t,invertedIndex:e,pipeline:this.pipeline.toJSON()}},R.Index.load=function(e){var t={},r={},i=e.fieldVectors,n={},s=e.invertedIndex,o=new R.TokenSet.Builder,a=R.Pipeline.load(e.pipeline);e.version!=R.version&&R.utils.warn("Version mismatch when loading serialised index. Current version of lunr '"+R.version+"' does not match serialized index '"+e.version+"'");for(var u=0;u<i.length;u++){var l=(h=i[u])[0],d=h[1];r[l]=new R.Vector(d)}for(u=0;u<s.length;u++){var h,c=(h=s[u])[0],f=h[1];o.insert(c),n[c]=f}return o.finish(),t.fields=e.fields,t.fieldVectors=r,t.invertedIndex=n,t.tokenSet=o.root,t.pipeline=a,new R.Index(t)}
/*!
 * lunr.Builder
 * Copyright (C) 2017 Oliver Nightingale
 */,R.Builder=function(){this._ref="id",this._fields=[],this.invertedIndex=Object.create(null),this.fieldTermFrequencies={},this.fieldLengths={},this.tokenizer=R.tokenizer,this.pipeline=new R.Pipeline,this.searchPipeline=new R.Pipeline,this.documentCount=0,this._b=.75,this._k1=1.2,this.termIndex=0,this.metadataWhitelist=[]},R.Builder.prototype.ref=function(e){this._ref=e},R.Builder.prototype.field=function(e){this._fields.push(e)},R.Builder.prototype.b=function(e){this._b=e<0?0:e>1?1:e},R.Builder.prototype.k1=function(e){this._k1=e},R.Builder.prototype.add=function(e){var t=e[this._ref];this.documentCount+=1;for(var r=0;r<this._fields.length;r++){var i=this._fields[r],n=e[i],s=this.tokenizer(n),o=this.pipeline.run(s),a=new R.FieldRef(t,i),u=Object.create(null);this.fieldTermFrequencies[a]=u,this.fieldLengths[a]=0,this.fieldLengths[a]+=o.length;for(var l=0;l<o.length;l++){var d=o[l];if(null==u[d]&&(u[d]=0),u[d]+=1,null==this.invertedIndex[d]){var h=Object.create(null);h._index=this.termIndex,this.termIndex+=1;for(var c=0;c<this._fields.length;c++)h[this._fields[c]]=Object.create(null);this.invertedIndex[d]=h}null==this.invertedIndex[d][i][t]&&(this.invertedIndex[d][i][t]=Object.create(null));for(var f=0;f<this.metadataWhitelist.length;f++){var p=this.metadataWhitelist[f],y=d.metadata[p];null==this.invertedIndex[d][i][t][p]&&(this.invertedIndex[d][i][t][p]=[]),this.invertedIndex[d][i][t][p].push(y)}}}},R.Builder.prototype.calculateAverageFieldLengths=function(){for(var e=Object.keys(this.fieldLengths),t=e.length,r={},i={},n=0;n<t;n++){var s=R.FieldRef.fromString(e[n]);i[o=s.fieldName]||(i[o]=0),i[o]+=1,r[o]||(r[o]=0),r[o]+=this.fieldLengths[s]}for(n=0;n<this._fields.length;n++){var o;r[o=this._fields[n]]=r[o]/i[o]}this.averageFieldLength=r},R.Builder.prototype.createFieldVectors=function(){for(var e={},t=Object.keys(this.fieldTermFrequencies),r=t.length,i=Object.create(null),n=0;n<r;n++){for(var s=R.FieldRef.fromString(t[n]),o=s.fieldName,a=this.fieldLengths[s],u=new R.Vector,l=this.fieldTermFrequencies[s],d=Object.keys(l),h=d.length,c=0;c<h;c++){var f,p,y,m=d[c],g=l[m],x=this.invertedIndex[m]._index;void 0===i[m]?(f=R.idf(this.invertedIndex[m],this.documentCount),i[m]=f):f=i[m],p=f*((this._k1+1)*g)/(this._k1*(1-this._b+this._b*(a/this.averageFieldLength[o]))+g),y=Math.round(1e3*p)/1e3,u.insert(x,y)}e[s]=u}this.fieldVectors=e},R.Builder.prototype.createTokenSet=function(){this.tokenSet=R.TokenSet.fromArray(Object.keys(this.invertedIndex).sort())},R.Builder.prototype.build=function(){return this.calculateAverageFieldLengths(),this.createFieldVectors(),this.createTokenSet(),new R.Index({invertedIndex:this.invertedIndex,fieldVectors:this.fieldVectors,tokenSet:this.tokenSet,fields:this._fields,pipeline:this.searchPipeline})},R.Builder.prototype.use=function(e){var t=Array.prototype.slice.call(arguments,1);t.unshift(this),e.apply(this,t)},R.MatchData=function(e,t,r){for(var i=Object.create(null),n=Object.keys(r),s=0;s<n.length;s++){var o=n[s];i[o]=r[o].slice()}this.metadata=Object.create(null),this.metadata[e]=Object.create(null),this.metadata[e][t]=i},R.MatchData.prototype.combine=function(e){for(var t=Object.keys(e.metadata),r=0;r<t.length;r++){var i=t[r],n=Object.keys(e.metadata[i]);null==this.metadata[i]&&(this.metadata[i]=Object.create(null));for(var s=0;s<n.length;s++){var o=n[s],a=Object.keys(e.metadata[i][o]);null==this.metadata[i][o]&&(this.metadata[i][o]=Object.create(null));for(var u=0;u<a.length;u++){var l=a[u];null==this.metadata[i][o][l]?this.metadata[i][o][l]=e.metadata[i][o][l]:this.metadata[i][o][l]=this.metadata[i][o][l].concat(e.metadata[i][o][l])}}}},R.MatchData.prototype.add=function(e,t,r){if(!(e in this.metadata))return this.metadata[e]=Object.create(null),void(this.metadata[e][t]=r);if(t in this.metadata[e])for(var i=Object.keys(r),n=0;n<i.length;n++){var s=i[n];s in this.metadata[e][t]?this.metadata[e][t][s]=this.metadata[e][t][s].concat(r[s]):this.metadata[e][t][s]=r[s]}else this.metadata[e][t]=r},R.Query=function(e){this.clauses=[],this.allFields=e},R.Query.wildcard=new String("*"),R.Query.wildcard.NONE=0,R.Query.wildcard.LEADING=1,R.Query.wildcard.TRAILING=2,R.Query.prototype.clause=function(e){return"fields"in e||(e.fields=this.allFields),"boost"in e||(e.boost=1),"usePipeline"in e||(e.usePipeline=!0),"wildcard"in e||(e.wildcard=R.Query.wildcard.NONE),e.wildcard&R.Query.wildcard.LEADING&&e.term.charAt(0)!=R.Query.wildcard&&(e.term="*"+e.term),e.wildcard&R.Query.wildcard.TRAILING&&e.term.slice(-1)!=R.Query.wildcard&&(e.term=e.term+"*"),this.clauses.push(e),this},R.Query.prototype.term=function(e,t){var r=t||{};return r.term=e,this.clause(r),this},R.QueryParseError=function(e,t,r){this.name="QueryParseError",this.message=e,this.start=t,this.end=r},R.QueryParseError.prototype=new Error,R.QueryLexer=function(e){this.lexemes=[],this.str=e,this.length=e.length,this.pos=0,this.start=0,this.escapeCharPositions=[]},R.QueryLexer.prototype.run=function(){for(var e=R.QueryLexer.lexText;e;)e=e(this)},R.QueryLexer.prototype.sliceString=function(){for(var e=[],t=this.start,r=this.pos,i=0;i<this.escapeCharPositions.length;i++)r=this.escapeCharPositions[i],e.push(this.str.slice(t,r)),t=r+1;return e.push(this.str.slice(t,this.pos)),this.escapeCharPositions.length=0,e.join("")},R.QueryLexer.prototype.emit=function(e){this.lexemes.push({type:e,str:this.sliceString(),start:this.start,end:this.pos}),this.start=this.pos},R.QueryLexer.prototype.escapeCharacter=function(){this.escapeCharPositions.push(this.pos-1),this.pos+=1},R.QueryLexer.prototype.next=function(){if(this.pos>=this.length)return R.QueryLexer.EOS;var e=this.str.charAt(this.pos);return this.pos+=1,e},R.QueryLexer.prototype.width=function(){return this.pos-this.start},R.QueryLexer.prototype.ignore=function(){this.start==this.pos&&(this.pos+=1),this.start=this.pos},R.QueryLexer.prototype.backup=function(){this.pos-=1},R.QueryLexer.prototype.acceptDigitRun=function(){var e,t;do{t=(e=this.next()).charCodeAt(0)}while(t>47&&t<58);e!=R.QueryLexer.EOS&&this.backup()},R.QueryLexer.prototype.more=function(){return this.pos<this.length},R.QueryLexer.EOS="EOS",R.QueryLexer.FIELD="FIELD",R.QueryLexer.TERM="TERM",R.QueryLexer.EDIT_DISTANCE="EDIT_DISTANCE",R.QueryLexer.BOOST="BOOST",R.QueryLexer.lexField=function(e){return e.backup(),e.emit(R.QueryLexer.FIELD),e.ignore(),R.QueryLexer.lexText},R.QueryLexer.lexTerm=function(e){if(e.width()>1&&(e.backup(),e.emit(R.QueryLexer.TERM)),e.ignore(),e.more())return R.QueryLexer.lexText},R.QueryLexer.lexEditDistance=function(e){return e.ignore(),e.acceptDigitRun(),e.emit(R.QueryLexer.EDIT_DISTANCE),R.QueryLexer.lexText},R.QueryLexer.lexBoost=function(e){return e.ignore(),e.acceptDigitRun(),e.emit(R.QueryLexer.BOOST),R.QueryLexer.lexText},R.QueryLexer.lexEOS=function(e){e.width()>0&&e.emit(R.QueryLexer.TERM)},R.QueryLexer.termSeparator=R.tokenizer.separator,R.QueryLexer.lexText=function(e){for(;;){var t=e.next();if(t==R.QueryLexer.EOS)return R.QueryLexer.lexEOS;if(92!=t.charCodeAt(0)){if(":"==t)return R.QueryLexer.lexField;if("~"==t)return e.backup(),e.width()>0&&e.emit(R.QueryLexer.TERM),R.QueryLexer.lexEditDistance;if("^"==t)return e.backup(),e.width()>0&&e.emit(R.QueryLexer.TERM),R.QueryLexer.lexBoost;if(t.match(R.QueryLexer.termSeparator))return R.QueryLexer.lexTerm}else e.escapeCharacter()}},R.QueryParser=function(e,t){this.lexer=new R.QueryLexer(e),this.query=t,this.currentClause={},this.lexemeIdx=0},R.QueryParser.prototype.parse=function(){this.lexer.run(),this.lexemes=this.lexer.lexemes;for(var e=R.QueryParser.parseFieldOrTerm;e;)e=e(this);return this.query},R.QueryParser.prototype.peekLexeme=function(){return this.lexemes[this.lexemeIdx]},R.QueryParser.prototype.consumeLexeme=function(){var e=this.peekLexeme();return this.lexemeIdx+=1,e},R.QueryParser.prototype.nextClause=function(){var e=this.currentClause;this.query.clause(e),this.currentClause={}},R.QueryParser.parseFieldOrTerm=function(e){var t=e.peekLexeme();if(null!=t)switch(t.type){case R.QueryLexer.FIELD:return R.QueryParser.parseField;case R.QueryLexer.TERM:return R.QueryParser.parseTerm;default:var r="expected either a field or a term, found "+t.type;throw t.str.length>=1&&(r+=" with value '"+t.str+"'"),new R.QueryParseError(r,t.start,t.end)}},R.QueryParser.parseField=function(e){var t=e.consumeLexeme();if(null!=t){if(-1==e.query.allFields.indexOf(t.str)){var r=e.query.allFields.map((function(e){return"'"+e+"'"})).join(", "),i="unrecognised field '"+t.str+"', possible fields: "+r;throw new R.QueryParseError(i,t.start,t.end)}e.currentClause.fields=[t.str];var n=e.peekLexeme();if(null==n){i="expecting term, found nothing";throw new R.QueryParseError(i,t.start,t.end)}if(n.type===R.QueryLexer.TERM)return R.QueryParser.parseTerm;i="expecting term, found '"+n.type+"'";throw new R.QueryParseError(i,n.start,n.end)}},R.QueryParser.parseTerm=function(e){var t=e.consumeLexeme();if(null!=t){e.currentClause.term=t.str.toLowerCase(),-1!=t.str.indexOf("*")&&(e.currentClause.usePipeline=!1);var r=e.peekLexeme();if(null!=r)switch(r.type){case R.QueryLexer.TERM:return e.nextClause(),R.QueryParser.parseTerm;case R.QueryLexer.FIELD:return e.nextClause(),R.QueryParser.parseField;case R.QueryLexer.EDIT_DISTANCE:return R.QueryParser.parseEditDistance;case R.QueryLexer.BOOST:return R.QueryParser.parseBoost;default:var i="Unexpected lexeme type '"+r.type+"'";throw new R.QueryParseError(i,r.start,r.end)}else e.nextClause()}},R.QueryParser.parseEditDistance=function(e){var t=e.consumeLexeme();if(null!=t){var r=parseInt(t.str,10);if(isNaN(r)){var i="edit distance must be numeric";throw new R.QueryParseError(i,t.start,t.end)}e.currentClause.editDistance=r;var n=e.peekLexeme();if(null!=n)switch(n.type){case R.QueryLexer.TERM:return e.nextClause(),R.QueryParser.parseTerm;case R.QueryLexer.FIELD:return e.nextClause(),R.QueryParser.parseField;case R.QueryLexer.EDIT_DISTANCE:return R.QueryParser.parseEditDistance;case R.QueryLexer.BOOST:return R.QueryParser.parseBoost;default:i="Unexpected lexeme type '"+n.type+"'";throw new R.QueryParseError(i,n.start,n.end)}else e.nextClause()}},R.QueryParser.parseBoost=function(e){var t=e.consumeLexeme();if(null!=t){var r=parseInt(t.str,10);if(isNaN(r)){var i="boost must be numeric";throw new R.QueryParseError(i,t.start,t.end)}e.currentClause.boost=r;var n=e.peekLexeme();if(null!=n)switch(n.type){case R.QueryLexer.TERM:return e.nextClause(),R.QueryParser.parseTerm;case R.QueryLexer.FIELD:return e.nextClause(),R.QueryParser.parseField;case R.QueryLexer.EDIT_DISTANCE:return R.QueryParser.parseEditDistance;case R.QueryLexer.BOOST:return R.QueryParser.parseBoost;default:i="Unexpected lexeme type '"+n.type+"'";throw new R.QueryParseError(i,n.start,n.end)}else e.nextClause()}},O=this,F=function(){return R},"function"==typeof define&&define.amd?define(F):"object"==typeof exports?module.exports=F():O.lunr=F()}();