var fs = require('fs'); 
var csv = require('fast-csv');

var files = [];

for (let j = 0; j < process.argv.length; j++) {  
	if (j > 1){
		files.push(process.argv[j]);
	}
}


var availablebibs={};
var bibs={};
var temporaryBibSlot=1;

LoadPermanentBibs(function(){
	LoadAvailableBibs(function(){
		files.map(LoadStartList);
	});
});

function LoadStartList(filename){
	var csvStream = csv.createWriteStream({headers: false}),
		writableStream = fs.createWriteStream("output_"+filename);

	csvStream.pipe(writableStream);

	var headers = ["Bib","Club","First","Last","Year of Birth","USSS Number","Sex (Masters or XC)","Cross Reference 1","Cross Reference 2","SRR","USSA Paid","Payment Method","USSS Paid Note","Registration Note","Racer Process Note","<eor>"];
	LoadCsv(filename, headers, function(data){
	 	if (data.Bib == ""){
	 		if (!bibs.hasOwnProperty(data["USSS Number"])){
	 			bibs[data["USSS Number"]] = availablebibs[temporaryBibSlot++];
	 		}
	 		data.Bib = bibs[data["USSS Number"]];
	 	}
		csvStream.write(data);
	});
}

function LoadAvailableBibs(callback){
	var headers = ["Slot","Bib"];
	LoadObjFromCsv(availablebibs, "availablebibs.csv", headers, callback);
}

function LoadPermanentBibs(callback){
	var headers = ["Member","Bib"];
	LoadObjFromCsv(bibs, "permanentbibs.csv", headers, callback);
}

function LoadObjFromCsv(obj, filename, headers, callback){
	var i=0;
	LoadCsv(filename, headers, function(data){
	 	if (i==0) { i++; }
	 	else {
			obj[data[headers[0]]] = data[headers[1]];
	 	}
	}, callback);
}

function LoadCsv(filename, headers, onData, onEnd){
	var stream = fs.createReadStream(filename);
	var i=0;
	csv
	 .fromStream(stream, {headers : headers})
	 .on("data", function(data){
	 	if (typeof onData == 'function'){
	 		onData(data);
	 	}
	 })
	 .on("end", function(){
	 	if (typeof onEnd == 'function'){
	 		onEnd();
	 	}
	});
}