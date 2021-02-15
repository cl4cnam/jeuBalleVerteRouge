'use strict';
/** 
	svgElt.js
	Librairie pour simplifier la génération des éléments SVG.
	Auteur : Véronique Lion
	Date création : 16/11/2018 16h40
	Copyright : © Véronique Lion 2018
*/

var SVG ={
		xmlns: 'http://www.w3.org/2000/svg',

	// comme innerHTML mais ajoute à la fin au lieu de tout effacer
	innerSVG: function(elt_parent, string_dessin){
		let elt = this.createSvgElt(string_dessin);
		elt_parent.appendChild(elt);
		return elt; // pour pouvoir agir sur l’élément une fois placé.
	},
	
	//crée un élément à partir d'un string
	createSvgElt: function(string_dessin){
		let arrayStringDessin = string_dessin.split(' ');
		arrayStringDessin.splice(1, 0, `xmlns="${this.xmlns}"`);

		let newStringDessin = arrayStringDessin.join(' ');
		let dessinSvg = new DOMParser().parseFromString(
			newStringDessin,
			'application/xml'
		);
		return document.importNode(dessinSvg.documentElement, true);
	},
	
	vectorElement: function(elt){
		return document.createElementNS(this.xmlns, elt);
	},

	/** les balises */
	//g, defs...
	balise: function(elt_parent, s_balise, id){
			let balise = this.vectorElement(s_balise);
			if(id)
				balise.id = id;
			elt_parent.appendChild(balise);
			return balise;
	},
	//balise svg
	svgElement: function(elt_parent, w, h, id ){
		let svg = this.vectorElement('svg');
		if(id)
			svgElement.id = id;
		svg.setAttribute("width", w);
		svg.setAttribute("height", h);
		elt_parent.appendChild(svg);
		return svg;
	},

	layersMultiple: function(elt_parent, tab_idLayers ){
		let tab_layers = [];
		for (var i = 0; i<tab_idLayers.length ; i++){
			let layer = this.vectorElement('g');
			layer.id = tab_idLayers[i];
			elt_parent.appendChild(layer);
			tab_layers[i]= layer;
		}
		return tab_layers;
	},


	/** les formes */
	rect: function(elt_parent, x, y, w, h, fill, stroke){
		let rect = this.vectorElement('rect');
			rect.setAttribute('x',x);
			rect.setAttribute('y',y);
			rect.setAttribute('width',w);
			rect.setAttribute("height", h);
			if(fill)
				rect.setAttribute("fill", fill);
			if(stroke)
				rect.setAttribute("stroke", stroke);
			elt_parent.appendChild(rect);
			return rect;
	},

	cercle: function(){},

	/** les gradiants */
	gradiant: function(elt_def, id, x1, x2, y1, y2){
		let gradiant = this.vectorElement('linearGradient');
		gradiant.id = id;
		gradiant.setAttribute('gradientUnits',"objectBoundingBox");
		gradiant.setAttribute('x1',x1);
		gradiant.setAttribute('x2',x2);
		gradiant.setAttribute('y1',y1);
		gradiant.setAttribute('y2',y2);
		elt_def.appendChild(gradiant);
		return gradiant;
	},

	stop: function(elt_gradiant, id, offset, style){
		let stop = this.vectorElement('stop');
		stop.id = id;
		stop.setAttribute('offset', offset);
		stop.setAttribute('style', style);
		elt_gradiant.appendChild(stop);
		return stop;
	}
}
