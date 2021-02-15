'use strict'

// Les objets
//============

const createBalle = createCreateurCube(class {
	constructor(ps_nom) {
		this.nom = ps_nom
		this.angle = 0
		this.rayon = (ps_nom=='un')?100:70
		this.bon = false
		
		this.$_selfDrawing = createDot(ps_nom)
		
		this.$_changeQuality = SC.repeatForever(
			SC.await(SCSENSOR('click_dot_'+this.nom)),
			SC.action(O=>{ this.bon = !this.bon })
		)
		this.$_mouvement = SC.repeatForever(
			SC.await(SCSENSOR('tictac')),
			SC.action(O=>{ this.angle += Math.PI/32 })
		)
		this.$_presentation = SC.repeatForever(
			SC.generate(
				SCEVT('jeMePresente_' + this.nom),
				O=>({
					x:this.rayon*Math.cos(this.angle),
					y:this.rayon*Math.sin(this.angle),
					bon:this.bon
				})
			)
		)
	}
})

// La coordination
//================

SC.startProg(
	SC.par(
		createBalle('un'),
		createBalle('deux'),
		SC.generateTickAtInterval(500, 'tictac')
	)
)
