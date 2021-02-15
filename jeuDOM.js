'use strict'

//===============================
//
// Préparation
// -----------
//
//===============================

const esp = document.getElementById('espaceTravail')

function drawNewDot() {
	const lElt_dot = SVG.createSvgElt('<circle cx="0" cy="0" r="10"/>')
	esp.appendChild(lElt_dot)
	return lElt_dot
}

function setDotColor(pElt_dot, ps_color) {
	pElt_dot.style.fill = ps_color
}

function moveDotColorTo(pElt_dot, x, y) {
	const dx = x + esp.width.baseVal.value / 2
	const dy = esp.height.baseVal.value / 2 - y
	const ls_transform = "translate(" + dx + "px," + dy + "px)"
	pElt_dot.style.transform = ls_transform
}

//===============================
//
// Jeu
// ---
//
//===============================

// Les objets
//============

const createDot = createCreateurCube(class {
	constructor(ps_nom) {
		this.aElt_dot = drawNewDot()
		this.aElt_dot.name = ps_nom
		
		this.$_ui = SC.listen(this.aElt_dot, 'click', SCSENSOR('click_dot_'+this.aElt_dot.name))
		
		this.$_affiche = actionOnForever(['jeMePresente_' + this.aElt_dot.name], pArray_presentations => {
			let presentation = pArray_presentations[0]
			const ls_bgColor = (presentation.bon) ? 'green': 'red'
			setDotColor(this.aElt_dot, ls_bgColor)
			moveDotColorTo(this.aElt_dot, presentation.x, presentation.y)
		})
	}
})
