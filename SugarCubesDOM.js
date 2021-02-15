'use strict'
/** 
	SugarCubesDOM.js
	Librairie pour faire une machine d'exécution générique pour SugarCubes pour le DOM.
	Auteur : Claude Lion
	Date création : 2020/03/10 
	Copyright : © Claude Lion 2020
*/

function reactMultiple(pMachine){
	let compteur = 0
	pMachine.react()
	//~ while(pMachine.somethingNew){
	while(pMachine.toContinue){
		pMachine.react()
		//~ console.log('toContinue', pMachine.toContinue)
		compteur += 1
		if (compteur > 25) break
		console.log('compteur', compteur)
	}
}

SC.machine().constructor.prototype.start = function(pProgramme) {
	if(! this.demarree) {
		this.demarree = true
		reactMultiple(this)
	}
}

SC.differGen = function(pn_delay, pSensor) {
	return SC.action(function(pMachine) {
		setTimeout(function() {
			dispatchEvent(new Event('tick_'+pSensor.name))
		}, pn_delay)
		externalEvent(pMachine, window, 'tick_'+pSensor.name, pSensor, 1)
	})
}

SC.generateTick = function(pn_delay, ps_typeTick) {
	return SC.differGen(pn_delay, SCSENSOR(ps_typeTick))
}

SC.multiDifferGen = function(pn_nbreFois, pn_delay, pSensor) {
	return SC.action(function(pMachine) {
		let compteur = pn_nbreFois
		//~ let compteur = 4
		const handle = setInterval(function() {
			dispatchEvent(new Event('tick_'+pSensor.name))
			compteur -= 1
			if(compteur === 0) clearInterval(handle)
		}, pn_delay)
		externalEvent(pMachine, window, 'tick_'+pSensor.name, pSensor, pn_nbreFois)
	})
}

SC.generateTickAtInterval = function(pn_delay, ps_typeTick) {
	return SC.multiDifferGen(-1, pn_delay, SCSENSOR(ps_typeTick))
}

let cpt = 0
SC.waitMs = function(pn_delay) {
	const lEvt_ajoutProg = SC.evt('ajoutProg')
	return SC.parex(lEvt_ajoutProg,
		SC.seq(
			SC.action(function(pMachine) {
				cpt += 1
				const lSensor = SC.sensor('wait' + cpt + ' ' + pn_delay + ' ms')
				setTimeout(function() {
					dispatchEvent(new Event('tick_'+lSensor.name))
				}, pn_delay)
				externalEvent(pMachine, window, 'tick_'+lSensor.name, lSensor, 1)
				pMachine.generateEvent(lEvt_ajoutProg, SC.await(lSensor))
			}),
			SC.pause()
		)
	)
}

// version légèrement modifiée de systemEvent de JFS
function externalEvent(pMachine, pElt_target, ps_DomEvt, pSensor, pn_nbreFois) {
	if (pn_nbreFois === undefined) pn_nbreFois = -1
	let compteur = pn_nbreFois
	if (!pSensor) pSensor = new SC.sensor('' + pElt_target + '.' + ps_DomEvt)
	if (ps_DomEvt == 'raf') {
		const lFunc_raf = function() {
			pMachine.generateEvent(pSensor)
			reactMultiple(pMachine)
			compteur -= 1
			if(compteur > 0) requestAnimationFrame(lFunc_raf)
			//~ if (!pMachine.stopRaf) requestAnimationFrame(lFunc_raf)
			//~ else pMachine.stopRaf = false
		}
		requestAnimationFrame(lFunc_raf)
	} else {
		const lFunc_handler = function(evt) {
			pMachine.generateEvent(pSensor, evt)
			reactMultiple(pMachine)
			compteur -= 1
			if(compteur === 0) pElt_target.removeEventListener(ps_DomEvt, lFunc_handler)
		}
		pElt_target.addEventListener(ps_DomEvt, lFunc_handler)
	}
	return pSensor
}

SC.listen = function(pElt_target, ps_DomEvt, pSensor) {
	return SC.action(function(pMachine) {
		externalEvent(pMachine, pElt_target, ps_DomEvt, pSensor, SC.forever)
	})
}
