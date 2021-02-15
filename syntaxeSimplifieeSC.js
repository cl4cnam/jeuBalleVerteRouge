'use strict'

/** 
	SyntaxeSimplifieeSC.js
	Bibliothèque surcouche facilitation SugarCubes.js
	Auteur : Claude Lion
	Date création : 10/10/2018
	Copyright : © Claude Lion 2018
*/

//====================================
// Gestionnaire d'événements globaux
//====================================

//Fabrique un événement par chaîne de caractères
const g_AllSCevents = {}
const g_AllSCsensors = {}
function SCEVT(ps_nom) {
	if(g_AllSCevents[ps_nom] === undefined) {
		g_AllSCevents[ps_nom] = SC.evt(ps_nom)
	}
	return g_AllSCevents[ps_nom]
}

function SCSENSOR(ps_nom) {
	if(g_AllSCsensors[ps_nom] === undefined) {
		g_AllSCsensors[ps_nom] = SC.sensor(ps_nom)
	}
	return g_AllSCsensors[ps_nom]
}

//======================================
// Syntaxe simplifiée version "extends"
//======================================

function parseInstr(ps_texte, pArrayS_nomInstr){
	// ps_methExtractionReste = 'reste' | 'nombre'
	for(let ls_nomInstr of pArrayS_nomInstr){
		if(ps_texte.startsWith(ls_nomInstr)){
			const ls_reste = ps_texte.substring(ls_nomInstr.length)
			const lArray_nombre = ps_texte.match(/\d+/g)
			return {instr: ls_nomInstr, reste: ls_reste, nombres: lArray_nombre}
		}
	}
	return false
}

function getPropertyUntilSCCube(pSCCube_proto) {
	if (pSCCube_proto.constructor !== undefined && pSCCube_proto.constructor !== SCCube) {
		return Object.getOwnPropertyNames(pSCCube_proto).concat( getPropertyUntilSCCube(pSCCube_proto.__proto__) )
	} else {
		return []
	}
}

//permet de créer un cube en même temps que l'objet.
class SCCube extends SC.cube().constructor {
	constructor(...pArray_args) {
		super(null, null)
		if(! pArray_args.length) pArray_args = [{}]
		this.o = this
		this.evtKillInstance = SC.evt('kill instance')
		
		this.a_AllSCevents = {}
		this.SCEVT = function(ps_nom) {
			if(this.a_AllSCevents[ps_nom] === undefined) {
				this.a_AllSCevents[ps_nom] = SC.evt(ps_nom)
			}
			return this.a_AllSCevents[ps_nom]
		}
		
		this.a_AllSCsensors = {}
		this.SCSENSOR = function(ps_nom) {
			if(this.a_AllSCsensors[ps_nom] === undefined) {
				this.a_AllSCsensors[ps_nom] = SC.sensor(ps_nom)
			}
			return this.a_AllSCsensors[ps_nom]
		}
		
		
		const lArray_methodes = getPropertyUntilSCCube(this.__proto__)
		
		const lArray_prog = []
		for(let ls_nomMeth of lArray_methodes) {
			const pushWithKill = (pProg) => {
				this['kill_' + ls_nomMeth] = SC.evt('kill_' + ls_nomMeth)
				lArray_prog.push(
					SC.kill(
						SC.or(
							SCEVT('kill_' + this.constructor.name + '_' + ls_nomMeth),
							this['kill_' + ls_nomMeth]
						),
						pProg
					)
				)
			}
			
			if(ls_nomMeth.substring(0,1) == '$') {
				const {instr, reste, nombres} = parseInstr(ls_nomMeth, [
					'$actionForever_', '$repeat', '$on_', '$_', '$onNo_',
					'$const_', '$publicConst_',
					'$var_', '$publicVar_',
					'$property_', '$publicProperty_'
				])
				if(instr == '$actionForever_') {
					pushWithKill( SC.action(this[ls_nomMeth].bind(this), SC.forever) )
				}else if(instr == '$repeat'){
					const ln_nbFois = parseInt(nombres[0])
					pushWithKill(SC.repeat( ln_nbFois, ...this[ls_nomMeth]() ))
				}else if(instr == '$const_' || instr == '$publicConst_' || instr == '$var_' || instr == '$publicVar_'){
					const ls_nomVar = reste
					const lArray_args = (pArray_args[0][ls_nomMeth] == undefined)
							? []
							: pArray_args[0][ls_nomMeth]
					if(instr == '$const_' || instr == '$publicConst_'){
						this[ls_nomVar] = this[ls_nomMeth](...lArray_args)
					}else{
						this[ls_nomVar] = this[ls_nomMeth].bind(this, ...lArray_args)
					}
					if(instr == '$publicVar_' || instr == '$publicConst_'){
						pushWithKill(SC.generate(
							SCEVT(ls_nomVar),
							this[ls_nomVar],
							SC.forever
						))
					}
				}else if(instr == '$property_' || instr == '$publicProperty_'){
					const ls_nomProperty = reste
					const lArray_parts = this[ls_nomMeth]()
					this[ls_nomProperty] = this.defineProperty(...lArray_parts)
					pushWithKill(SC.repeat( SC.forever, this[ls_nomProperty] ))
					if(instr == '$publicProperty_'){
						pushWithKill(SC.generate(
							SCEVT(ls_nomProperty),
							this[ls_nomProperty].valeur,
							SC.forever
						))
					}
				}else if(instr == '$on_'){//uniquement avec undefined, SC.forever
					const ls_nomEvt = ls_nomMeth.match(/_[A-Za-z0-9]+(?=_|$)/g)[0].substring(1)
					pushWithKill(SC.actionOn(
						SCEVT(ls_nomEvt),
						(pArray_allEvt, pMachine)=>{
							const lArray_evt = pArray_allEvt[SCEVT(ls_nomEvt)]
							this[ls_nomMeth](lArray_evt, pMachine)
						},
						undefined,
						SC.forever
					))
				}else if(instr == '$onNo_'){//uniquement avec SC.NO_ACTION, SC.forever
					const ls_nomEvt = ls_nomMeth.match(/_[A-Za-z0-9]+(?=_|$)/g)[0].substring(1)
					pushWithKill(SC.actionOn(
						SCEVT(ls_nomEvt),
						SC.NO_ACTION,
						(pMachine)=>{
							this[ls_nomMeth]([], pMachine)
						},
						SC.forever
					))
				}else if(instr == '$_') {
					pushWithKill( this[ls_nomMeth]() )
				}
			}
		}
		
		this.p = SC.kill(SC.or(SCEVT('kill_' + this.constructor.name), this.evtKillInstance),
			SC.par(...lArray_prog)
		)
	}
	defineProperty(p_initVal, pArrayS_evt, pFunc) { // function pFunc(p_val, ...pArray_valEnvoyees)
		const symb = Symbol()
		this[symb] = p_initVal;
		if(typeof pFunc === 'string' || pFunc instanceof String) {
			pFunc = this[pFunc].bind(this)
		}
		const lCell = SC.cell({
			target: this,
			field: symb,
			sideEffect: (val, evts)=>{
				const lArray_evts = pArrayS_evt.map(ps_evt=>evts[SCEVT(ps_evt)])
				const l_ret = pFunc(val, ...lArray_evts)
				return l_ret
			},
			eventList: pArrayS_evt.map(SCEVT)
		})
		lCell.valeur = ()=>lCell.val()
		return lCell
	}
}

//===========================================
// Fonctions utilitaires pour createProperty
//===========================================

const F = {}
F.idem = (val, pArray_valEnvoyees)=>val
F.count = (val, pArray_valEnvoyees)=>(pArray_valEnvoyees || []).reduce((acc, curr)=>acc+1, 0)
F.sum = (val, pArray_valEnvoyees)=>(pArray_valEnvoyees || []).reduce((acc, curr)=>acc+curr, 0)
F.product = (val, pArray_valEnvoyees)=>(pArray_valEnvoyees || []).reduce((acc, curr)=>acc*curr, 1)
F.min = (val, pArray_valEnvoyees)=>(pArray_valEnvoyees || []).reduce((acc, curr)=>Math.min(acc,curr), Infinity)
F.max = (val, pArray_valEnvoyees)=>(pArray_valEnvoyees || []).reduce((acc, curr)=>Math.max(acc,curr), -Infinity)

//=========================================
// Syntaxe simplifiée version "fonctions"
//=========================================

const g_AllProperty = {}

function createCreateurCube(pFunc_createur) {
	return function(...args) {
		// création du cube basique
		//-------------------------
		const newObj = new pFunc_createur(...args)
		const newCube = SC.cube(null, null)
		newCube.o = newCube
		Object.assign(newCube, newObj)
		Object.getOwnPropertyNames(newObj.__proto__).forEach(function(property){
			newCube[property] = newObj.__proto__[property]
		})
		
		// traitement des méthodes actives
		//--------------------------------
		let lArray_methodes = Object.getOwnPropertyNames(newObj)
		lArray_methodes = lArray_methodes.concat(Object.getOwnPropertyNames(newObj.__proto__))
		
		const lArray_prog = []
		for(let indexAttr of lArray_methodes) {
			//~ if(newCube.debog) console.log(indexAttr)
			const attr = newCube[indexAttr]
			//~ if(newCube.debog) console.log('interne : ', indexAttr, attr, '#####', attr.constructor.name)
			if (indexAttr === 'o') continue
			if (attr && attr.constructor
					//~ && attr.constructor.name.startsWith
					//~ && attr.constructor.name.startsWith('SC_')
					&& indexAttr.startsWith('$_')) {
				lArray_prog.push(attr)
			}
		}
		newCube.p = SC.par(...lArray_prog)
		//~ if(newCube.debog) console.log(newCube.p.toString())
		return newCube
	}
}

function createCube(pFunc_createur) {
	return createCreateurCube(pFunc_createur)()
}

//=========================================
// Syntaxes simplifiées communes
//=========================================

function actionForever(pFunc_method) {
	return SC.action(pFunc_method, SC.forever)
}

function and(...pArray) {
	if (pArray.length === 1) {
		return pArray[0]
	}else{
		return SC.and(...pArray)
	}
}

function doUntil(pObj_prog) {
	const lProg_then = pObj_prog.then || SC.nothing()
	return SC.kill(
		pObj_prog.until,
		pObj_prog.do,
		lProg_then,
	)
}

function repeatUntil(pObj_prog) {
	return doUntil({
		do: SC.repeat(SC.forever,
			pObj_prog.repeat
		),
		until: pObj_prog.until,
		then: pObj_prog.then,
	})
}

function actionOnForever(pArrayS_nomEvt, pFunc_action) {
	// pFunc_action(pArray_evt1,...,pArray_evtN)
	return SC.actionOn(
		and(...pArrayS_nomEvt.map(SCEVT)),
		function(pArray_allEvt, p_machine) {
			const lArrayArray_evt = pArrayS_nomEvt.map(   ls_nomEvt  =>  pArray_allEvt[SCEVT(ls_nomEvt)]   )
			pFunc_action(...lArrayArray_evt.concat([p_machine]))
		},
		undefined,
		SC.forever
	)
}

SC.actionIfAllEvent = function(pArrayS_nomEvt, pFunc_action, pn_nbreFois) {
	// pFunc_action(pArray_evt1,...,pArray_evtN)
	return SC.actionOn(
		and(...pArrayS_nomEvt.map(SCEVT)),
		function(pArray_allEvt, p_machine) {
			const lArrayArray_evt = pArrayS_nomEvt.map(   ls_nomEvt  =>  pArray_allEvt[SCEVT(ls_nomEvt)]   )
			pFunc_action(...lArrayArray_evt.concat([p_machine]))
		},
		undefined,
		pn_nbreFois
	)
}

function createProperty(p_initVal, pArrayS_nomEvtInfluenceurs, pFunc_influence) {
	// function pFunc_influence(p_val, ...pArray_valEnvoyees)
	const symb = Symbol()
	g_AllProperty[symb] = p_initVal;
	const lCell = SC.cell({
		target: g_AllProperty,
		field: symb,
		sideEffect: (val, evts)=>{
			const lArray_evts = pArrayS_nomEvtInfluenceurs.map(ps_evt=>evts[SCEVT(ps_evt)])
			const l_ret = pFunc_influence(val, ...lArray_evts)
			return l_ret
		},
		eventList: pArrayS_nomEvtInfluenceurs.map(SCEVT)
	})
	lCell.valeur = ()=>lCell.val()
	lCell.genre = 'property'
	return lCell
}

SC.machine().constructor.prototype.addActor = function(pProgramme) {
	if(pProgramme.init) pProgramme.init(this)
	this.addProgram(pProgramme)
}

SC.repeatForeverButInterrupt = function(scevt, prog) {
	return SC.kill( scevt, SC.repeatForever(prog) )
}

SC.repeatAtInterval = function(pn_nbreFois, pn_delay, pProg) {
	return SC.repeat(pn_nbreFois,
		SC.waitMs(pn_delay),
		pProg
	)
}

SC.repeatActionAtInterval = function(pn_nbreFois, pn_delay, pFunc) {
	return SC.repeatAtInterval(pn_nbreFois, pn_delay, SC.action(pFunc))
}

SC.action_ = (tgt, fun, ...args) => SC.action(SC._(tgt,fun), ...args)
SC.actionIfAllEvent_ = (pArrayS_nomEvt, tgt, fun, pn_nbreFois) => SC.actionIfAllEvent(pArrayS_nomEvt, SC._(tgt,fun), pn_nbreFois)
SC.repeatActionAtInterval_ = (pn_nbreFois, pn_delay, tgt, fun) => SC.repeatActionAtInterval(pn_nbreFois, pn_delay, SC._(tgt,fun))

SC.startProg = function(p_prog) {
	const m = SC.machine(undefined, {init:SC.par()})
	m.addProgram(p_prog)
	m.start() 
}
