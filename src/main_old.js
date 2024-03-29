////////////
let ploidyA ="";
let lgtChro =[]; //longueur des chromosomes
let chrBands = [];
let config;
let annotTable=[]; // annot file splited by line
let acc;
let chr_tsv;
let annotData;
var ideogram;
var ideogramChr;
//taille du triangle
var annotHeight = 3.5;

//

//Définition des tracks
var annotationTracks = [
	{id: 'RLK', displayName: 'RLK', color: '#CCCCCC', shape: 'triangle'},
	{id: 'NLR', displayName: 'NLR', color: '#8D8D8D', shape: 'triangle'},
	{id: 'RLP', displayName: 'RLP', color: '#494949', shape: 'triangle'}
]; 

//Legende
var legend = [{
	name: 'Annotations',
	rows: [
	  {name: 'RLK', color: '#CCCCCC', shape: 'triangle'},
	  {name: 'NLR', color: '#8D8D8D', shape: 'triangle'},
	  {name: 'RLP', color: '#494949', shape: 'triangle'}
	]
}];


//Config de la vue globale
function initConfig(){
	console.log("init config");
	config = { 
		organism: "oryza-sativa",
		//repertoire vers les données de chromosome bands
		dataDir: './data/bands/native/',
		container: '.ideo_container_global',
		orientation: "vertical",
		rotatable: false,
		ploidy: 1, 
		ploidysize: 12,
		annotationTracks: annotationTracks, 
		annotationHeight: annotHeight,
		chrHeight: 500,
		chrWidth: 15,
		//couleur de base des chromosomes
 		ancestors: {
			"A": "#7AA1D2",
			"B": "#7AA1D2",
			"C": "#7AA1D2"
		}, 
		ploidyDesc: ["AB", "AB", "AB", "AB", "AB", "AB", "AB", "AB", "AB", "AB", "AB", "AB"],
		rangeSet: [],
	};
	return config;
}


////////////////////////////////////////////////////////////////
//LOAD ACCESSION
////////////////////////////////////////////////////////////////
let selectAccession = document.getElementById("selectAccession");
selectAccession.addEventListener("change", async function(){
	//console.log(this.value);

	acc = this.value;
	clear();
	//affiche le loader
	document.getElementById("loader").style.display = "block";
	config = initConfig();
	config.annotationsPath='http://dev.visusnp.southgreen.fr/geloc/data/annotations/'+acc+'.json';
	
	//charge le fichier densité de l'accession choisie
	let response = await fetch('http://dev.visusnp.southgreen.fr/geloc/data/density/ideo_'+acc+'.txt');
	annotData = await response.text();
	//Parse les données de densité
	config.rangeSet = annotationParser(annotData);
    
	//charge les données de chromosomes de l'accession choisie
	//fichier tsv
	response = await fetch('http://dev.visusnp.southgreen.fr/geloc/data/chromosomes/'+acc+'.tsv');
	chr_tsv = await response.text();
	//parse les données et config les chrBands
	chromosomeTsvParser(chr_tsv);
	
	//Charge ideogram
	//load_ideogram(config);
	ideogram = new Ideogram(config);

	//apparition du bouton download
	$('#download').fadeIn()

	//cache le lettres
	setTimeout(removeLetters, 100);

	//LEGEND
	drawLegend();

	/////// à virer si je remet les tooltips
	loadingoff();

	//ajoute listener click chromosome
	setTimeout(onClickChr, 100);
});

////////////////////////////////////////////////////////////////
//parsing fichier chromosome TSV
//Genère les bands pour chaque chromosome
////////////////////////////////////////////////////////////////
function chromosomeTsvParser(data){
	console.log("parse chromosome");
    chrBands=[];

	//split le fichier par ligne de chromosome
	const split = data.split("\n");
	let columns  = "";

	//nombre de chromosomes
    config.ploidysize = split.length-1;
    
    //max length
    let max_chr_length =0;
	for (let i = 1; i < split.length; i++) {
        columns = split[i].split("\t");
        bp_stop = parseInt(columns[3]);
        if(bp_stop > max_chr_length){
            max_chr_length = bp_stop;
        }
    }
	
	//pour chaque chromosome
	for (let i = 1; i < split.length; i++) {
        
        //LocalSplit[0] = chromosome choisi, localsplit[1] = longeur du chromosome
        //#chromosome	arm	bp_start	bp_stop
        //1	p	0	16700000
        //1	q	16700000	43270923
        columns = split[i].split("\t");

        chr = columns[0];
        arm = columns[1];
        band = '1';
        bp_start = parseInt(columns[2]);
        bp_stop = parseInt(columns[3]);
        
		//ajouter condition sur arm = p ou q
		//si p => on ajoute une band gpos50 puis une band acen
		//si q => on ajoute une band acen puis une band gpos50
		if(arm == 'p'){
			//position des bands gpos et acen sur le bras p
			gposStar = bp_start;
			gposStop = (bp_stop - bp_stop/10);
			acenStart = (bp_stop - bp_stop/10);
			acenStop = bp_stop;
			//push les positions dans la config ideogram
			gposBand = chr+" "+arm+" "+band+" "+gposStar+" "+gposStop+" "+gposStar+" "+gposStop+" gpos50";
			acenBand = chr+" "+arm+" "+band+" "+acenStart+" "+acenStop+" "+acenStart+" "+acenStop+" acen";
			chrBands.push(gposBand);
			chrBands.push(acenBand);
		}else{
			//position des bands acen et gpos sur le bras q
			acenStart = bp_start;
			acenStop = (bp_start + bp_start/10);
			gposStar = (bp_start + bp_start/10);
			gposStop = bp_stop;
			//push les positions dans la config ideogram
			acenBand = chr+" "+arm+" "+band+" "+acenStart+" "+acenStop+" "+acenStart+" "+acenStop+" acen";
			gposBand = chr+" "+arm+" "+band+" "+gposStar+" "+gposStop+" "+gposStar+" "+gposStop+" gpos50";
			chrBands.push(acenBand);
			chrBands.push(gposBand);
		}
	}
	//console.log(chrBands);
}


////////////////////////////////////////////////////////////////
//parsing des données de densité pour afficher les couleurs
////////////////////////////////////////////////////////////////
function annotationParser(data){
	//console.log("parse annot");
	annotTable = data.split("\n");
	let colonne  = "";
	//var data = "";
	//let localannot="";
	let ploidy=[];
	let count =0;

	let rangeSet = [];
	
	//pour chaque ligne d'annot
	for (let i = 0; i < annotTable.length; i++) {
		ploidy = [];
		colonne = annotTable[i].split(" ");
		count++;
		
		//Boucle qui sert a définir la position de l'annotation
		for(let n = 0; n< config.ploidy; n++){
			////console.log(n + " " + parseInt(colonne[1]));
			if(n == parseInt(colonne[1])){
				////console.log("egal");
				ploidy.push(1);
			}else {
				ploidy.push(0);
				////console.log("pas egal");
			}	
		}
		////console.log(ploidy);
		
		chromosome = {
			chr: colonne[0],
			ploidy: ploidy,
			start: colonne[2],
			stop: colonne[3],
			color: colonne[4]
			//color: config.anotcolor[localsplit[4]]
		};
		rangeSet.push(chromosome);
	////console.log(config.rangeSet);
	}
	return rangeSet;
	////console.log(ligne.length+" "+ count);
}

function updateploidy(value){
	//console.log("update ploïdie");
	config.ploidy = Number(value);
	//load_ideogram();
}

function loadingon(){
	document.getElementById("loader").style.display = "block";
}
function loadingoff(){
	document.getElementById("loader").style.display = "none";
}

////////////////////////////////////////////////////////////////
// load ideogram global
////////////////////////////////////////////////////////////////
function load_ideogram(config){

	//chromosomeTsvParser(chr_tsv);

	//parse les valeurs d'entrée
	//chromosomeParser(chrdata);
	//config.rangeSet = annotationParser(annotData);
	
	
	//Crée le graph
	//if(chrdata != ""){
		//console.log(config);
		ideogram = new Ideogram(config);

	//}
	//apparition du bouton download
	$('#download').fadeIn()
	//repositione();
	//$('#potatosalad').on('click', function(event){
    //The event won't be propagated to the document NODE and 
    // therefore events delegated to document won't be fired
   //event.stopPropagation();
	//});
}

//Ajoute les tooltips, lien vers genome browser
function addTooltip(){

	//console.log("add tooltip");
	//compteur pour retrouver les infos de coordonées du bloc
	let blocCount = 0;

	//parcourir chaque .range de .range-set = chaque bloc svg
	//si transparent => supprimer le bloc
	//sinon copier le bloc et append to range-set.parent dans une nouvelle balise g
	$(".range").each(function(index ){

		if ($(this).attr('style') == 'fill: transparent;'){
			////console.log("remove");
			$(this).remove();

		}else{
			//retreive annotations of the current bloc
			let annotBloc = annotTable[blocCount];

			const annotElements = annotBloc.split(' ');
			
			let chr = annotElements[0];
			let start = annotElements[2];
			let stop = annotElements[3];
			//console.log(chr + ' ' + start+ ' '+stop);

			let rangeset = $(this).parent();
			let chromosome = rangeset.parent();

			//retrieve chromosome position
			//let clippath = chromosome.attr('clip-path');
			//const regexp = /(chr\d+)/.exec(clippath);

			//set the url to the retrieved chromosome
			let url = 'Go to Banana Jbrowse\<br/\>\<a href=\"https://banana-genome-hub.southgreen.fr/jbrowse_ma2/?loc=chr'+chr+':'+start+'..'+stop+'\"\>Chr'+chr+' '+start+'..'+stop+'\<\/a\>'
			let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			g.setAttributeNS(null, 'class', 'bloc-annot');

			//set the tooltip content, link to genome browser
			g.setAttribute('title', url);
			chromosome.append(g);

			let annot = $(this)[0].cloneNode(true);
			annot.setAttribute('style', 'fill: transparent');
			g.append(annot);
			blocCount++;
			//console.log(blocCount);
			
		}
	});
	//tooltipster activation
    $('.bloc-annot').tooltipster({
		theme: 'tooltipster-punk',
		contentAsHTML: true,
		//content: $('#tooltip_content'),
		interactive: true,
		contentCloning: true,
		delay: 100
	});
	
	loadingoff();
}

////////////////////////////////////////////////////////////////
// Fonction qui recalcul le schéma à partir des données dans les cadres
////////////////////////////////////////////////////////////////
function update(){
	//console.log("update");
	clear();
	config = initConfig();
	loadingon();
	load_ideogram();
	repositione();
	setTimeout(addTooltip, 100); //addTooltip();
}

////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////
function load_file(){
	//console.log("chr to form");
	$("#editorChr").text("");
	//$("#fileInputC").show();
	const fileInputC = document.getElementById('fileInputC');
	//fileInputC.addEventListener('change', function(e) {
		const file = fileInputC.files[0];
		const reader = new FileReader();
		reader.onload = function(e) {

			const lines = reader.result.split('\n');
			if (lines[lines.length - 1] ==""){
				let texte = "";
				for(let i = 0; i < lines.length -1; i++){
					if (i < lines.length -2){
						texte = texte + lines[i];
						texte = texte + '\n';
					}
					else{
						texte = texte + lines[i];
					}
				}
				$("#editorChr").text(texte);
			}
			else{
				$("#editorChr").text(reader.result);
			}	

			//$("#editorChr").text(reader.result);
			//$("#fileInputC").hide();
		};
		reader.readAsText(file);  
	//});   
}

function load_file2(){
	//console.log("annot to form");
	$("#fileInputD").show();
	const fileInputD = document.getElementById('fileInputD');
	//fileInputD.addEventListener('change', function(e) {
		const file = fileInputD.files[0];
		const reader = new FileReader();
		reader.onload = function(e) {

			//$("#editorAnnot").text(reader.result);

			const lines = reader.result.split('\n');
			if (lines[lines.length - 1] ==""){
				let texte = "";
				for(let i = 0; i < lines.length -1; i++){
					if (i < lines.length -2){
						texte = texte + lines[i];
						texte = texte + '\n';
					}
					else{
						texte = texte + lines[i];
					}
				}
				$("#editorAnnot").text(texte);
			}
			else{
				$("#editorAnnot").text(reader.result);
			}	
			//$("#fileInputD").hide();
		};
		reader.readAsText(file); 
	//});   
}


function repositione(){
	//console.log("repositione");
	setTimeout(function(){
		const ideo = document.getElementById("_ideogram");
		//var tideo = document.getElementById("targetideo");
		//tideo.appendChild(ideo);
	}, 50);
}


function clear(){
	//console.log("clear");

	const element = document.getElementById("_ideogramOuterWrap"); //_ideogram
	if(element != null){
		element.parentNode.removeChild(element);
	}
	const div = document.getElementById("ideo_div");
	if(div != null){
		div.parentNode.removeChild(div);
	}
	const sca = document.getElementById("scale");
		if(sca != null){
		sca.parentNode.removeChild(sca);
	}
	//config = initConfig();
}

//cache les lettres
function removeLetters(){
	const letters = document.getElementsByClassName("chrLabel");
	for (i = 0; i < letters.length; i++) { 
		if(letters[i].parentElement.className.baseVal == "chromosome "){
			letters[i].style.display="none";
		}
	}
}



//////////////////
//LEGEND
//////////////////

function drawLegend(){

	var canvas = document.getElementById('legend');
	var ctx = canvas.getContext('2d');

	ctx.fillStyle = "#CCCCCC";
	ctx.fillText('RLK', 10, 30);
	ctx.beginPath();
    ctx.moveTo(10, 0); // x y 
    ctx.lineTo(20, 10);
	ctx.lineTo(10, 20);
    ctx.fill();

	ctx.fillStyle = "#8D8D8D";
	ctx.fillText('NLR', 40, 30);
	ctx.beginPath();
    ctx.moveTo(40, 0); // x y 
    ctx.lineTo(50, 10);
	ctx.lineTo(40, 20);
	ctx.fill();
	
	ctx.fillStyle = "#494949";
	ctx.fillText('RLP', 70, 30);
	ctx.beginPath();
    ctx.moveTo(70, 0); // x y 
    ctx.lineTo(80, 10);
	ctx.lineTo(70, 20);	
	ctx.fill();

	var gradient = ctx.createLinearGradient(0, 0, 200, 0);
	gradient.addColorStop(0.16, '#7AA1D2');
	gradient.addColorStop(0.32, '#7dc7d2');
	gradient.addColorStop(0.48, '#bce2ca');
	gradient.addColorStop(0.64, '#d5e1b5');
	gradient.addColorStop(0.80, '#e8ce92');
	gradient.addColorStop(1, '#f4a769');

	ctx.fillStyle = gradient;
	ctx.fillRect(10, 50, 200, 50);

	ctx.fillStyle = "black";
	ctx.fillText('0', 15, 75);
	ctx.fillText('5+', 195, 75);

}

////////////////////////////////////////////////////////////////
// load ideogram chromosome
////////////////////////////////////////////////////////////////
function load_ideogram_chr(configChr){
	//const chrdata = $("#editorChr").val();
	//values in data form
	//const annotdata = $("#editorAnnot").val();
	///////////////////////////////config.ploidyDesc = [];
	//updateploidy($('#selectorploidy').val());
    //parse les valeurs d'entrée
    //chromosomeTsvParser(chr_tsv)
	//chromosomeParser(chrdata);
	
	
	
	/////////////////////
	////////////////////// Il se passe qq chose là !!!!!
	//configChr.rangeSet = annotationParser(annotData);
	
	//Crée le graph
	//if(chrdata != ""){
		//console.log(config);
		ideogramChr = new Ideogram(configChr);

	//}
	//apparition du bouton download
	$('#download').fadeIn()
	repositione();
	$('#potatosalad').on('click', function(event){
    //The event won't be propagated to the document NODE and 
    // therefore events delegated to document won't be fired
   //event.stopPropagation();
	});
}

//////////////////////////////////////////
// Affichage du chromosome horizontal 
//////////////////////////////////////////
function onClickChr(){
	$(".ideo_container_global").find(".bands").each(function(index ){
		$(this).on("click", function(){
			clickedChrom = index + 1 ;
			if(clickedChrom<10){
				clickedChrom = "0"+clickedChrom;
				clickedChrom = parseInt(clickedChrom);
			} 
			console.log("draw chr "+ clickedChrom);

			configChr = config;
			configChr.orientation = "horizontal";
			configChr.chromosome = clickedChrom.toString();
			configChr.container = '.ideo_container_chr';
			configChr.rotatable = 'false';
            configChr.chrHeight = 800;
            configChr.chromosomeScale = 'absolute';
			configChr.brush = 'chr'+clickedChrom+':10000000-13000000';
			//configChr.chrMargin: 50,
			//configChr.chrWidth: 15,
			configChr.onBrushMove = writeSelectedRange;
    		configChr.onLoad = writeSelectedRange;
			

			//parse les valeurs de range set de densité pour ne recupérer que celles du chromosomes choisi
			let rangeSetChr = configChr.rangeSet;
			let newRangeSetChr = [];
			rangeSetChr.forEach(function(range){
				//si chrom courant = on push dans la config
				if(range['chr'] == clickedChrom){
					console.log("je suis sur le chrom "+range['chr']);
					newRangeSetChr.push(range);
				}
			});
			configChr.rangeSet = newRangeSetChr;

			document.getElementById("chr_region").style.display = "block";
			//load_ideogram_chr(configChr);
			ideogramChr = new Ideogram(configChr);

			setTimeout(removeLetters, 100);

		});
	});
}

////////////////////////////////////////////////////////
// Affiche des informations de la portion selectionnée
////////////////////////////////////////////////////////
function writeSelectedRange() {
    var r = ideogram.selectedRegion,
        from = r.from.toLocaleString(), // Adds thousands-separator
        to = r.to.toLocaleString(),
		extent = r.extent.toLocaleString();

	//affiche les positions
    document.getElementById('from').innerHTML = from;
    document.getElementById('to').innerHTML = to;
	document.getElementById('extent').innerHTML = extent;
	
	//supprime les espaces dans les positions
	from = from.replace(/\s/g, "");
	to = to.replace(/\s/g, "");
	//console.log(typeof(from));
	//console.log("region from "+from+" to "+to+ " extent "+extent);

	//Appel au serveur
    socket.emit('run', from, to, function(err, report){
        if(err){
            console.log(err);
        }else{
			//console.log(report);
			const gffResult = document.getElementById('gffResult');
			gffResult.innerHTML = report;
		}
	});

  }

//Création de la div de resultats
function createResultDiv(content) {

    const body = document.querySelector('body');
    var div = document.createElement('div');
    var pre = document.createElement('pre');
    div.setAttribute('class', 'container');
    pre.textContent = content;
    //div.innerHTML = content;
    loadingoff();
    div.appendChild(pre);
    body.appendChild(div); 
}

function ploidyDescGenerator(haplotype,chrNumber){
    /*
    ploidyDesc: [
        'ABC',
        'ABC',
        'ABC',
        'ABC',
        'ABC',
        'ABC',
        'ABC',
        [...]
    ],
    */
    let ploidyDesc = [];
    let chrStr = [];
    for (let i = 0; i < chrNumber; i++) {
        for (let i = 0; i < haplotype; i++) {
            chrStr.push(String.fromCharCode('a'.charCodeAt(0) + i))
        }
        ploidyDesc.push(chrStr.join(""));
        chrStr = [];
    }
    return ploidyDesc;
}









