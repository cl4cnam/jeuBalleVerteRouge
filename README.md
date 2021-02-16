jeuBalleVerteRouge
==================

Je reprends les commentaires que j'avais faits et je rajoute en gras italique les endroits du code où trouver un exemple de chaque point.

les commentaires envoyés la fois passée + les endroits du code
=============================================================

Pour éviter qu'on ne soit sur une longueur d'onde différente, j'essaie de mieux expliquer comment je voyais l'évolution de SC.

### A) La bibliothèque SC comprendrait plusieurs parties :

- SC core (***SugarCubes.js***)
- SC Dom : qui ferait la traduction entre le Dom et les sensors (***SugarCubesDOM.js***)
- SC Gtk : qui ferait la traduction entre le Gtk et les sensors (***pas fait***)
- ...
	
Le programmeur aurait à prendre SC core et une des autres parties.

### B) SC core exposerait uniquement :

- SC.machine() (sans possibilité de mettre un arg "delay") (***utilisation : syntaxeSimplifieeSC.js, ligne 354***)
- SC.&lt;instruction> (***dispersés***)
- SC.evt(), SC.generateEvent() (***pas utilisé ici***)
	
Les machines exposeraient uniquement :
- addProgram (***utilisation : syntaxeSimplifieeSC.js, ligne 355***)
- start (qui lancerait le premier reactMultiple) (***utilisation : syntaxeSimplifieeSC.js, ligne 356***) (***définition : SugarCubesDOM.js, ligne 23***)
	
Parmi les instructions :
- SC.listen(<typeDeSensor>) (***utilisation : jeuDOM.js, ligne 44***) (***définition : SugarCubesDOM.js, ligne 106***)
- SC.generateTick(delay, &lt;typeDeTick>) (***pas utilisé***) (***définition : SugarCubesDOM.js, ligne 39***)
- SC.generateTickAtInterval(delay, &lt;typeDeTick>) (***utilisation : jeu.js, ligne 43***) (***définition : SugarCubesDOM.js, ligne 56***)
	
Les "tick" seraient des types particuliers de sensor.
